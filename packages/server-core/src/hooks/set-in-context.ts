
import { HookContext } from '../../declarations'

/**
 * This hook is used to set a string value in the context.
 * If you want a value to be based on another value then use
 * following setField hook.
 * https://hooks-common.feathersjs.com/hooks.html#setfield
 */
export default (propertyName: string, propertyValue: string, inData?: false) => {
  return (context: HookContext): HookContext => {
    if (inData) {
      if (Array.isArray(context.data)) {
        context.data = context.data.map((item) => {
          return {
            ...item,
            [propertyName]: propertyValue
          }
        })
      } else {
        context.data = {
          ...context.data,
          [propertyName]: propertyValue
        }
      }
    } else {
      context.params.query = {
        ...context.params.query,
        [propertyName]: propertyValue
      }
    }
    return context
  }
}
