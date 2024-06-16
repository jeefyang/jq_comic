
import { CSSProperties, ExtractPropTypes, Fragment, PropType, VNode, defineComponent } from "vue";


export type JFlexSize = number | string;
export type JFlexAlign = "start" | "end" | "center" | "baseline";
export type JFlexDirection = "vertical" | "horizontal";

export const jflexProps = {
  align: String as PropType<JFlexAlign>,
  /** 排序,vertical垂直,horizontal水平 */
  direction: {
    type: String as PropType<JFlexDirection>,
    default: "horizontal" as JFlexDirection,
  },
  size: {
    type: [Number, String, Array] as PropType<
      number | string | [JFlexSize, JFlexSize]
    >,
    default: 8,
  },
  /** 是否换行 */
  wrap: Boolean,
  /** 是否填充满,仅用于垂直模式 */
  fill: Boolean,
  /** 是否最够一个填满,仅用于水平模式 */
  isLastGrow: Boolean,
  /** 均分,仅用于水平模式 */
  split: Boolean
};

export type JFlexProps = ExtractPropTypes<typeof jflexProps>;

function filterEmpty(children: VNode[] = []) {
  const nodes: VNode[] = [];
  children.forEach((child) => {
    if (Array.isArray(child)) {
      nodes.push(...child)
    }
    else if (child.type === Fragment) {
      nodes.push(...filterEmpty(child.children as VNode[]))
    }
    else {
      nodes.push(child)
    }
  });
  return nodes.filter(
    (c) =>
      !(
        c &&
        (c.type === Comment ||
          (c.type === Fragment && c.children?.length === 0) ||
          (c.type === Text && (c.children as string).trim() === "")
        )
      )
  )
}

export const JFlex = defineComponent({
  name: "JFlex",
  props: jflexProps,
  setup(props, context) {
    const { slots } = context;
    const getMargin = (size: JFlexSize) => {
      if (typeof size === "number") {
        return size + 'px';
      }
      return size
    }

    const getMarginStyle = (isLast: boolean): CSSProperties => {
      const style: CSSProperties = {}

      const marginRight = `${getMargin(Array.isArray(props.size) ? props.size[1] : props.size)}`

      const marginBottom = `${getMargin(Array.isArray(props.size) ? props.size[1] : props.size)}`
      if (props.split && props.direction === "horizontal") {
        style.flexGrow = 1
      }
      if (isLast) {
        if (props.wrap) {
          style.marginBottom = marginBottom
        }
        if (props.direction === "horizontal" && props.isLastGrow) {
          style.flexGrow = 1
        }
        return style
      }

      if (props.direction === 'horizontal') {
        style.marginRight = marginRight
      }

      if (props.direction === "vertical" || props.wrap) {
        style.marginBottom = marginBottom
      }
      return style
    }

    const getParentStyle = () => {
      const style: CSSProperties = {}
      style.display = 'flex'
      if (props.direction === "vertical") {
        style.flexDirection = "column"
      }
      else if (props.direction === "horizontal") {
        style.flexDirection = 'row'
      }
      if (props.wrap) {
        style.flexWrap = "wrap"
      }


      return style
    }

    return () => {
      const children = filterEmpty(slots.default?.())
      return (
        <div
          class={'jflex'}
          style={getParentStyle()}
        >
          {children.map((c, i) => (
            <div
              key={`item-${i}`}
              class={'jflex-item'}
              style={getMarginStyle(i === children.length - 1)}
            >
              {c}
            </div>
          ))}
        </div>
      )
    }
  },
});

