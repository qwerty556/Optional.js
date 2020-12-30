


const ______typeToken = "Optional|awmcl,apqk,ujtnujmrpfuawiqto3jj49j3urjfrfv4j94rh 39ef893ir9qo2eqi2jkro3krto3jkofjuefjowhwfr83i10o2kei3eiqqlxajr8dia3jtpg4ajg84h"
const isOptional = any=>(typeof any === "object") && (any??{______typeToken:""}).______typeToken === ______typeToken
const isIteratableObject = (any) => typeof any === "object" && (!Array.isArray(any) && Object.values(any).length > 0)
const isArray = (any) => Array.isArray(any)

const defaultOption = {
    unSafeItems:[
        undefined,
        null,
        Number.isNaN,
    ],
    methodAlias:{}
}

const Optional = (any,option={})=>{

    if(isOptional(any)){
        return Optional(any.unwrapping(),Object.assign(any.option,option))
    }
    
    
    const optionalObject = {
        ______typeToken:______typeToken,
        obj:any,
        option:Object.assign({},defaultOption,option),
        getOrElse(_propNames,_elseVal){
            const item = this.get(_propNames)
            if(item.isUnSafe()){
                return typeof _elseVal === "function" 
                    ? _elseVal(this.unwrapping(),Object.assign({},this.option)) 
                    : _elseVal
            }
            
            return item.unwrapping()
        },
        get(_propNames){

            if(typeof _propNames !== "string"){
                throw new Error("_propNames is string")
            }

            if(_propNames === "" ){
                return Optional(this)
            }

            const propNames = 
                _propNames[0] === "[" ? _propNames : 
                _propNames[0] === "." ? _propNames : 
                "." + _propNames 

            try {
                return Optional(eval("this.unwrapping()" + propNames),this.option)
            } catch (error) {
                return Optional(undefined,this.option)
            }
        },
        unwrapping(){
            return this.obj
        },
        isSafe(){
            return !this.isUnSafe()
        },
        isUnSafe(){
            return this.unSafeItems().some((any)=>{
                return typeof any === "function" 
                    ? any(this.obj)
                    :any === this.obj
            })
        },
        unSafeItems(){
            return [...this.option.unSafeItems]
        },
        
        /**
         * 
         * @param {function(obj):any} mapper 
         * @returns {Optional[any]}
         */
        map(mapper){
            if(this.isSafe())
                return Optional(mapper(this.unwrapping()),this.option)
            else 
                return Optional(this)
        },
        flat(dept=1){
            if(dept <= 0 || this.isUnSafe() || [...this].every((any)=> !isArray(any) && !isIteratableObject(any))){
                return Optional(this)
            }
            
            const newItems =  [...this].map((any)=>{
                if (isIteratableObject(any)){
                    return Object.values(any)
                }else
                    return any 
            }).flat(1)
            return Optional(newItems,this.option).flat(dept-1)
        },
        toJSON(){
            return [...this]
        }
    }

    //AliasSetter
    Object.entries(optionalObject.option.methodAlias).forEach(([alias,funcName]=entr)=>{
        if(optionalObject[alias] !== undefined){
            throw Error(alias + " is cant use alias name")
        }

        if(typeof funcName === "function"){
            const func = funcName
            optionalObject[alias] = func
        }

        if(typeof optionalObject[funcName] === "function"){
            const func = optionalObject[funcName]
            optionalObject[alias] = func
        }
    })


    //iterator
    optionalObject[Symbol.iterator] = function(){
        const values = 
            isArray(optionalObject.obj) ? optionalObject.obj:
            isIteratableObject(optionalObject.obj) ? Object.values(optionalObject.obj)
            :[optionalObject.obj]

        return {
            values:values.slice() ,
            next() {
                if(this.values.length === 0){
                    return {done:true}
                }

                const val = this.values.shift()
                if(Optional(val,optionalObject.option).isUnSafe()){
                    return this.next()
                }
                
                return {done:false,value:val}
            }
        }
    }

    return optionalObject

}

export default Optional