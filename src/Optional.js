


const ______typeToken = "Optional|awmcl,apqk,ujtnujmrpfuawiqto3jj49j3urjfrfv4j94rh 39ef893ir9qo2eqi2jkro3krto3jkofjuefjowhwfr83i10o2kei3eiqqlxajr8dia3jtpg4ajg84h"
const isOptional = any=>(typeof any === "object") && (any??{______typeToken:""}).______typeToken === ______typeToken

const defaultOption = {
    unSafeItems:[
        undefined,
        null,
        Number.isNaN,
    ]
}

const Optional = (any,option={})=>{

    if(isOptional(any)){
        return Optional(any.unwrapping(),this.option)
    }
    
    
    const optionalObject = {
        ______typeToken:______typeToken,
        obj:any,
        option:Object.assign({},defaultOption,option),
        getOrElse(_propNames,_elseVal){
            const item = this.get(_propNames)
            if(item.isUnSafe()){
                return typeof _elseVal === "function" ? _elseVal(this.obj,Object.assign({},this.option)): _elseVal
            }
            
            return item.unwrapping()
        },
        get(_propNames){

            if(typeof _propNames !== "string"){
                throw new Error("_propNames is string")
            }

            if(_propNames.trim() === "" ){
                return Optional(this.obj,this.option)
            }

            const propNames = 
                _propNames[0] === "[" ? _propNames : 
                _propNames[0] === "." ? _propNames : 
                "." + _propNames 

            try {
                return Optional(eval("this.obj" + propNames),this.option)
            } catch (error) {
                return Optional(undefined,this.option)
            }
        },
        unwrapping(){
            return this.obj
        },
        isSafe(){
            return !this.unSafeItems().some((any)=>{
                return typeof any === "function" 
                    ? any(this.obj) 
                    :any === this.obj
            })
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
            return Optional(mapper(this.obj),this.option)
        }
    }

    optionalObject[Symbol.iterator] = function(){
        const values = Array.isArray(optionalObject.obj)?optionalObject.obj:(typeof optionalObject.obj === "object")?Object.values(optionalObject.obj):[optionalObject.obj]
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