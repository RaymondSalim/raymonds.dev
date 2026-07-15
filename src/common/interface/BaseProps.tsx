import Dimension from './Dimension';

export default interface BaseProps {
  dimension?: Dimension
  className?: string
  onclick?: () => void
  onfocus?: () => void
}
