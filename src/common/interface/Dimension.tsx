import { Property } from 'csstype';

export default interface Dimension {
  height?: Property.Height
  width?: Property.Width
  padding?: Property.Padding
  margin?: Property.Margin
  widthToHeightRatio?: number
}
