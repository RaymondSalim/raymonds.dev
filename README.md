<h1 align="center">Raymond's Personal Website</h1>
<hr style="height: 5px">

## Description
<hr>
Raymond's personal site made with react, tailwindcss using TypeScript.

## Setup
<hr>

### Git Hooks
There are some git hooks in the `scripts/hooks` folder. To simplify the git hooks setup process, a shell script has been created. Ensure you are in the root of the repository, and run:
```markdown
sudo chmod +x ./scripts/setup-hooks.sh
./scripts/setup-hooks.sh
```
This will copy all the scripts in `script/hooks` to `.git/hooks` folder, and suffix any hooks with `.local`
## Development Style
<hr>

### Commit Message Format
We follow [Conventional Commit's](https://www.conventionalcommits.org/en/v1.0.0/) guidelines with a bit of alteration.
```markdown
<type>(<scope>): <short summary> [optional body] [optional footer(s)]
  │       │             │
  │       │             └─⫸ Summary.
  │       │
  │       └─⫸ Commit Scope: Feature or package that is affected
  │
  └─⫸ Commit Type: feat|fix|chore|perf|test

e.g. feat(navbar): added missing navigation
```
The `<type>`, `<scope>` and `<short summary>` are required


#### Type

Must be one of the following:
* **feat**: A new feature
* **fix**: A bug fix
* **chore**: Changes that does not affect the code
* **perf**: A code change that improves performance
* **test**: Adding missing tests or fixing existing tests

### Git Branching
We follow [Trunk Based Development's](https://trunkbaseddevelopment.com) guidelines with a bit of alteration

#### Branch Naming
Branch naming is similar to the commit message formatting
```markdown
<type>/<issue-id>-[description]
   │        │           │
   │        │           └─⫸ Short description of commit (or issue title)
   │        └─⫸ Issue ID (Jira / GitHub Issue) (see below)
   └─⫸ Branch type: feat|fix|chore|perf|test

```
All `<type>`, `<issue-id>`, `[description]` are required.

#### Type

Must be one of the following:
* **feat**: A new feature
* **fix**: A bug fix
* **chore**: Changes that does not affect the code
* **perf**: A code change that improves performance
* **test**: Adding missing tests or fixing existing tests


#### Issue ID
Issue ID depends on where the issue was raised:
* GitHub: use `GH-${issueID}`
* Jira: use `PW-${issueID}`

#### Merging
Starting from release `v0.6.1`, all Pull Requests to the `main` branch from the `release` branch should be `Rebase and Merge`. all Pull Requests from the `development` branch to the `release` branch should be `Squash and Merge`. `Create a Merge Commit` is never used in this repository.

### Deployment Flow
There are two environments, `staging` and `production`.
#### Staging
All commits to the `staging` branch should be merged via a pull-request. Only administrators have the right to push directly into the remote `staging` branch.

After the pull-request is merged. Simply comment `/deploy`, and a GitHub action will be triggered that will automatically deploy the merged branch.

#### Production
All commits should be merged into a new `release` branch, with its version number, e.g. `release/v0.5.0`. Merging to the `release` branch can be should be done via a pull-request.

Before merging the `release` branch into `main`, an administrator should update the CHANGELOG.md.

After the pull-request is merged. Simply comment `/deploy`, and a GitHub action will be triggered that will automatically deploy the merged branch.


#### Note
* Currently, only the repository owner has the right to trigger the `/deploy` github action
