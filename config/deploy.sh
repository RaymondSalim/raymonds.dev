#!/bin/bash
set -e
unset ENV

PROD="production"
STG="staging"

allowedEnv=("${STG}" "${PROD}")
allowedYn=("y" "n")
allowedTrueFalse=("true" "false")
# Variables for console color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

__help="
Usage: $(basename $0) [OPTIONS]

Options:
  -e, --environment <env>     The destination environment. One of [staging, production]
  -p, --password <pass>       Password to decrypt the deployed page (Required if <env> is staging)
  -y, --no-prompt             Do not prompt before deployment
  -t, --token                 Git Token for deployment (required if deploying to a different branch)
  -d, --debug                 Run script with higher verbosity
  -h, --__help                Print this message
"

print_error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}
print_help() {
  echo "$__help"
}
print_info() {
  echo -e "${YELLOW}$1${NC}"
}
print_success() {
  echo -e "${GREEN}$1${NC}"
}

while :; do
  case $1 in
    -h|--help)
      print_help
      exit 0
      ;;
    -e|--environment)
      if [[ "$2" ]]; then
        ENV=${2,,}
        shift
      else
          print_error "-e/--environment requires a value"
          exit 1
      fi
      ;;
    --environment=?*)
      ENV=${1#*=}
      ENV=${ENV,,}
      ;;
    --environment=)
      print_error "-e/--environment requires a value"
      exit 1
      ;;
    -p|--password)
      if [[ "$2" ]]; then
        CRYPTPASS=$2
        shift
      else
          print_error "-p/--password requires a value"
          exit 1
      fi
      ;;
    --password=?*)
      CRYPTPASS=${1#*=}
      ;;
    --password=)
      print_error "-p/--password requires a value"
      exit 1
      ;;
    -t|--token)
      if [[ "$2" ]]; then
        TOKEN=$2
        shift
      else
          print_error "-t/--token requires a value"
          exit 1
      fi
      ;;
    --token=?*)
      TOKEN=${1#*=}
      ;;
    --token=)
      print_error "-t/--token requires a value"
      exit 1
      ;;
    -d|--debug)
          if [[ "$2" ]]; then
            DEBUG=${2,,}
            shift
          else
              print_error "-d/--debug requires a value"
              exit 1
          fi
          ;;
    --debug=?*)
      DEBUG=${1#*=}
      DEBUG=${DEBUG,,}
      ;;
    --debug=)
      print_error "-d/--debug requires a value"
      exit 1
      ;;
    -y|--no-prompt)
      NOPROMPT=1
      ;;

    -?*)
      print_error "Unknown option: $1"
      exit 1
      ;;
    *)
      break
  esac
  shift
done

# check -e flag value
# shellcheck disable=SC2076
if [[ ! " ${allowedEnv[*],,} " =~ " ${ENV} " ]]; then
  print_error "Invalid value for -e flag"
  exit 1
fi

# check -d flag value
# shellcheck disable=SC2076
if [[ ! " ${allowedTrueFalse[*],,} " =~ " ${DEBUG} " ]]; then
  print_error "Invalid value for -d flag"
  exit 1
fi


if [ "${ENV}" = "${STG}" ]; then
  # Check if -p flag exists, else get from input
  if [ -z "$CRYPTPASS" ]; then
    read -srp $'Enter encryption key\n' CRYPTPASS
  fi
  DOMAIN='staging.raymonds.dev'
  REPO='PersonalWebsite_Staging'
elif [ "${ENV}" = "${PROD}" ]; then
  DOMAIN='raymonds.dev'
  REPO='PersonalWebsite'
fi

if [[ $DEBUG = true ]]; then
  print_info "Domain: ${DOMAIN}"
  print_info "Repository: ${REPO}"
  npmArgs="--loglevel verbose"
else
  npmArgs="--loglevel warn"
fi

if [[ -n $TOKEN ]]; then
  REPO_URL="https://git:${TOKEN}@github.com/RaymondSalim/${REPO}.git"
else
  REPO_URL="git@github.com:RaymondSalim/${REPO}.git"
fi

print_info "Installing dependencies"
npm install "$npmArgs" > /dev/null

print_info "Print current dir"
pwd
ls -lah

print_info "Building files"
CI=false REACT_APP_DEPLOYMENT_ENV="${ENV}" npm run "$npmArgs" build # setting CI=false to prevent craco interpreting warnings as errors

print_info "Generating CNAME"
echo "${DOMAIN}" > ./build/CNAME

# Encrypt file if staging env
if [ "${ENV}" = "${STG}" ]; then
  print_info "Encrypting HTML page"
  npx "$npmArgs" staticrypt './build/index.html' "$CRYPTPASS" -o './build/index.html'
fi

print_success "\nFile generated successfully"

if [[ "$NOPROMPT" -ne 1 ]]; then
  # Ensure input is only (y/n)
  # shellcheck disable=SC2076
  while [[ ! " ${allowedYn[*],,} " =~ " ${deployConf,,} " ]]; do
    read -r -p $'Proceed to deployment? (Y/n)\n' deployConf
  done
fi

if [ "n" = "${deployConf,,}" ]; then
  print_error "Deployment aborted"
  exit 1
fi

print_info "Start deployment to env:${ENV}"
gh-pages -d build --repo="${REPO_URL}" -u "github-actions-bot <support+actions@github.com>"
print_success "Deployment successful"
exit 0
