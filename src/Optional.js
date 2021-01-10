


const ______typeToken = "Optional|awmcl,apqk,ujtnujmrpfuawiqto3jj49j3urjfrfv4j94rh 39ef893ir9qo2eqi2jkro3krto3jkofjuefjowhwfr83i10o2kei3eiqqlxajr8dia3jtpg4ajg84h"
const isOptional = any => (typeof any === "object") && (any ?? { ______typeToken: "" }).______typeToken === ______typeToken

const defaultOption = {
    unSafeItems: [
        undefined,
        null,
        Number.isNaN,
    ],
    methodAlias: {},
    objectToArray: Object.values,
    isIteratableObject: (any) => typeof any === "object" && any !== null && !Array.isArray(any) && Object.values(any).length > 0,
    isArray:(any) => Array.isArray(any)
}

const Optional = (any, _option = {}) => {

    if (isOptional(any)) {
        const _optional = any
        return _optional.clone()
    }

    const option = Object.assign({}, defaultOption, _option)

    //helpers
    const objectToArray = option.objectToArray
    const isIteratableObject = option.isIteratableObject
    const isArray = option.isArray


    const op = {
        ______typeToken: ______typeToken,
        item: any,
        option: option,
        getOrElse(_propNames, _elseVal) {
            const item = this.get(_propNames)
            if (item.isUnSafe()) {
                return typeof _elseVal === "function"
                    ? _elseVal(this.unwrapping(), Object.assign({}, this.option))
                    : _elseVal
            }

            return item.unwrapping()
        },
        getOrFail(_propNames) {
            return item.getOrElse(_propNames,()=>{throw new TypeError()})
        },
        get(_propNames) {

            if (typeof _propNames !== "string") {
                throw new Error("_propNames is string")
            }

            if (_propNames === "") {
                return this.clone()
            }

            const propNames = (()=>{
                if(_propNames[0] === "[") return _propNames
                if(_propNames[0] === ".") return _propNames
                else return "." + _propNames
            })()


            try {
                return Optional(eval("this.unwrapping()" + propNames), this.option)
            } catch (error) {
                return Optional(undefined, this.option)
            }
        },
        unwrapping() {
            return this.item
        },
        isSafe() {
            return !this.isUnSafe()
        },
        isUnSafe() {
            return this.option.unSafeItems.some((any) => {
                return (
                    typeof any === "function"
                        ? any(this.unwrapping())
                        : any === this.unwrapping()
                )
            })
        },
        clone() {
            return Optional(this.item, this.option)
        },

        /**
         * @param {function(item):any} mapper 
         * @returns {Optional[any]}
         */
        map(mapper) {
            if (this.isSafe())
                return Optional(mapper(this.unwrapping()), this.option)
            else
                return this.clone()
        },
        /**
         * @param {function(item):any|void} mapper 
         * @returns
         */
        ifPresents(consumer) {
            this.map(consumer)
        },
        flat(dept = 1) {
            if (dept <= 0 || this.isUnSafe() || [...this].every((any) => !isArray(any) && !isIteratableObject(any))) {
                return this.clone()
            }

            const newItems = [...this].map((any) => {
                if (isIteratableObject(any)) {
                    return objectToArray(any)
                } else
                    return any
            }).flat(1)

            return Optional(newItems, this.option).flat(dept - 1)
        },
        toJSON() {
            return [...this]
        },
        extends(optional) {

            if (optional !== undefined && !isOptional(optional)) {
                throw Error("none arg or Optional")
            }

            const option = optional === undefined ? defaultOption : optional.option

            const clone = this.clone()

            Object.entries(option).forEach(([name, val]) => {
                if (isArray(val)) {
                    clone.option[name] = clone.option[name].concat(val)
                } else {
                    clone.option[name] = Object.assign({}, val, clone.option[name])
                }
            })

            return clone
        },
        [Symbol.iterator]: function () {
            const values = (()=>{
                if(isArray(this.unwrapping())) return this.unwrapping()
                if(isIteratableObject(this.unwrapping())) return objectToArray(this.unwrapping())
                else return [this.unwrapping()]
            })()

            return {
                values: values.slice(),
                option: this.option,
                next() {
                    if (this.values.length === 0) {
                        return { done: true }
                    }

                    const val = this.values.shift()
                    if (Optional(val, this.option).isUnSafe()) {
                        return this.next()
                    }

                    return { done: false, value: val }
                }
            }
        }
    }

    //AliasSetter
    Object.entries(op.option.methodAlias).forEach(([alias, funcName]) => {

        if (op[alias] !== undefined) {
            throw Error(alias + " is cant use alias name")
        }

        else if (typeof funcName === "function") {
            const func = funcName
            op[alias] = () => func(op, ...arguments)
        }

        else if (typeof op[funcName] === "function") {
            const func = op[funcName]
            op[alias] = func
        }
        
    })

    return op

}

export default Optional