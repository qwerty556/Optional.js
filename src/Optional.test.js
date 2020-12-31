import Optional from "./Optional"
//jest test
describe('OptionalTests', ()=>{
  const obj1 = {
    name:"obj1",
    obj2:{
      name:"obj2",
      obj4:{
        name:"obj4",
      }
    },
    obj3:{
      name:"obj3",
      array:["item1","item2",[
        "item3"
      ]]
    }
  }

  test('propertyAccess', ()=>{
    //obj1.name equivalent
    expect(Optional(obj1).getOrElse("name","lostName1")).toBe("obj1"); 
    expect(Optional(obj1).getOrElse(" name","lostName1")).toBe("obj1"); 
    expect(Optional(obj1).getOrElse("name ","lostName1")).toBe("obj1");
    expect(Optional(obj1).getOrElse(".name ","lostName1")).toBe("obj1");
    expect(Optional(obj1).getOrElse("['name'] ","lostName1")).toBe("obj1");

    //obj1.name.replace('obj','@@@')
    expect(Optional(obj1).getOrElse("name.replace('obj','@@@')","lostName1")).toBe("@@@1");
    expect(Optional(obj1).get("name.replace('obj','@@@')")).toStrictEqual(Optional("@@@1"));

    //undefined value access
    expect(Optional(obj1).getOrElse("name.replace_____('obj','@@@')","lostName1")).toBe("lostName1");
    expect(()=>Optional(obj1).get("name").map((any)=>any.replace_____('obj','@@@'))).toThrow(Error)
    expect(Optional(obj1).get("name____.replace('obj','@@@')")).toStrictEqual(Optional(undefined))
    expect(Optional(obj1).get("name____").map((any)=>any.replace('obj','@@@'))).toStrictEqual(Optional(undefined))
    
    //else can use function
    expect(Optional(obj1).getOrElse("name",()=>"lostName1")).toBe("obj1");

    // get arg1 is ""
    expect(Optional(obj1).get("").unwrapping()).toStrictEqual(obj1);
    expect(Optional(obj1).getOrElse("","lostObj1")).toStrictEqual(obj1);

    // other test
    expect(Optional(obj1).getOrElse("obj2.name","lost")).toBe("obj2");
    expect(Optional(obj1).getOrElse("obj3.name","lost")).toBe("obj3");
    expect(Optional(obj1).getOrElse("obj2.obj4.name","lost")).toBe("obj4");
    expect(Optional(obj1).getOrElse("obj3.array[-1]","none")).toBe("none");
    expect(Optional(obj1).getOrElse("obj3.array[0]","lost")).toBe("item1");
    expect(Optional(obj1).getOrElse("obj3.array[1]","lost")).toBe("item2");
    expect(Optional(obj1).getOrElse("obj3.array[2][0]","lost")).toBe("item3");
    expect(Optional(obj1).getOrElse("obj3.array[3]","none")).toBe("none");
    expect(Optional(obj1).get("obj3.array").getOrElse("[0]","none")).toBe("item1");
    expect(Optional(obj1).getOrElse("obj3.array.3","none")).toBe("none");
    expect(Optional(obj1).get("obj3.array[-1]").unwrapping()).toBe(undefined);
    expect(Optional(obj1).get("obj3.array[0]").unwrapping()).toBe("item1");
    
  });

  test('get', ()=>{
    expect(Optional(obj1).get("name")).toStrictEqual(Optional("obj1"));
    expect(Optional(obj1).get("undefinedProperty")).toStrictEqual(Optional(undefined));
  });

  test('elseValue', ()=>{
    expect(Optional(obj1).getOrElse("name","lost")).toBe("obj1");
    expect(Optional(obj1).getOrElse("undefinedProperty","none")).toBe("none");
    // use closure
    expect(Optional(obj1).getOrElse("undefinedProperty",(obj1)=>obj1.obj2.name)).toBe("obj2");
    expect(Optional(obj1).getOrElse("undefinedProperty",(obj1)=>Optional(obj1).get("obj2.name").unwrapping())).toBe("obj2");
  });

  //iterator is safe , auto except danger values
  test('safeIterator', ()=>{
    let array1 = [1,2,3,undefined,null,NaN,4,5,7]
    expect([...Optional(array1)]).toStrictEqual([1,2,3,4,5,7])

    let array2 = [1,2,3,undefined,null,NaN,4,5,7,{a:1,b:2,c:undefined,d:null,e:NaN}]

    for(const any of Optional(array2)){
      expect(Optional(any).isSafe()).toBe(true)
    }
    expect([...Optional(array2)]).toStrictEqual([1,2,3,4,5,7,{a:1,b:2,c:undefined,d:null,e:NaN}])

    let obj10 = {a:1,b:2,c:undefined,d:null,e:NaN,f:{g:undefined,h:3},i:4}
    
    for(const any of Optional(obj10)){
      expect(Optional(any).isSafe()).toBe(true)
      for(const any2 of Optional(any)){
        expect(Optional(any2).isSafe()).toBe(true)
      }
    }
    expect([...Optional(obj10)]).toStrictEqual([1,2,{g:undefined,h:3},4])

    expect([...Optional("unIteratable")]).toStrictEqual(["unIteratable"])
  });

  test('unsafeItems override', ()=>{
    let array0 = [1,2,3,undefined,null,NaN,4,5,7,7]
    let op0 = Optional(array0)
    //excepted default
    expect([...op0]).toStrictEqual([1,2,3,4,5,7,7])

    let array1 = [1,2,3,undefined,null,NaN,4,5,7,7]
    let op1 = Optional(array1,{
      unSafeItems:[1,2,3,(any)=>any===7]
    })
    //excepted 1,2,3,7
    expect([...op1]).toStrictEqual([undefined,null,NaN,4,5])


    let array2 = [1,2,3,undefined,null,NaN,4,5,7]
    let op2 = Optional(array2,{
      unSafeItems:[
        1,2,3,
        (any)=>any===7
        
      ]
    }).extends(Optional()) // default option extends    extends(Optional()) or extends()

    //excepted 1,2,3,7,undefined,null,NaN
    expect([...op2]).toStrictEqual([4,5])
    
  });

  test('map', ()=>{
    let obj20 = {
      name:"obj20",
      obj21:{
        name:"obj21",
        obj22:{
          name:"obj22",
        }
      }
    }
    expect(Optional(obj20).map((obj20)=>obj20.name)).toStrictEqual(Optional("obj20"))
    expect(Optional(obj20).map((obj20)=>obj20.name).map((obj20Name)=>obj20Name+"5555")).toStrictEqual(Optional("obj205555"))
  });

  test('base object does not change', ()=>{
    let obj30 = {
      name:"obj20",
      xxxx:null,
      obj21:{
        xxxx:null,
        name:"obj21",
        obj22:{
          name:"obj22",
        }
      }
    }

    let clone = JSON.parse(JSON.stringify(obj30))

    Optional(obj30).get("obj21.obj22").map((obj22)=>obj22.name)
    const _ = [...Optional(obj30)]
    expect(obj30).toStrictEqual(clone)
  });

  test('illegal args', ()=>{

    expect(()=>Optional([1,2,3,4,5]).getOrElse(1,"")).toThrow(Error)
    expect(()=>Optional([1,2,3,4,5]).getOrElse(["[0]"],"")).toThrow(Error)
    expect(()=>Optional([1,2,3,4,5]).getOrElse({a:1},"")).toThrow(Error)
    expect(()=>Optional([1,2,3,4,5]).getOrElse(true,"")).toThrow(Error)

  });

  test('optional wrapping is single wrap', ()=>{

    let op = Optional([1,2,3,4,5])

    let i = 100
    while(i-- > 0)
      op = Optional(op)

    expect(op).toStrictEqual(Optional([1,2,3,4,5]))

  });


  test('defaultOptionSetting', ()=>{

    const NumberOptional = (any,option) => {
      return Optional(any,Object.assign({},{
        unSafeItems:[
          (any)=>!(typeof any === "number" && isFinite(any))
        ]
      },option))
    }

    expect([...NumberOptional([1,2,3,4,5,"6",null,undefined,Number.NaN,"7",8,9])]).toStrictEqual([1,2,3,4,5,8,9])

  });


  test('methodAlias', ()=>{

    const op = (any,option) => {
      return Optional(any,Object.assign({},{
        methodAlias:{
          hoge:"getOrElse" // hoge is getOrElse
        }
      },option))
    }

    expect(op([[{a:11}]]).hoge("[0][0].a","none")).toBe(11)

    //can't use an existing name
    const op2 = (any,option) => {
      return Optional(any,Object.assign({},{
        methodAlias:{
          "getOrElse":()=>"bad"
        }
      },option))
    }

    expect(()=>op2([1,2,3])).toThrow(Error)

    //custom function
    //Oh.. It's not alias........🐎
    const opHasCustomFunc = (any,option) => {
      return Optional(any,Object.assign({},{
        methodAlias:{
          "hoge":(op)=>op.getOrElse("[1]","none"),
          "hoge2":function(op){return op.getOrElse("[2]","none")}
        }
      },option))
    }

    expect(opHasCustomFunc([10,20,30]).hoge()).toBe(20)
    expect(opHasCustomFunc([10,20,30]).hoge2()).toBe(30)
    
  });

  test('flat', ()=>{

    const obj = [
      {x:undefined,a:1,b:2,c:{
        x:null,a:3,b:4,e:{
          a:5,b:[6,7,Number.NaN]
        }
      }}
    ]
    
    expect(JSON.stringify(Optional(obj).flat())).toBe("[1,2,{\"x\":null,\"a\":3,\"b\":4,\"e\":{\"a\":5,\"b\":[6,7,null]}}]")  
    expect(JSON.stringify(Optional(obj).flat(1))).toBe("[1,2,{\"x\":null,\"a\":3,\"b\":4,\"e\":{\"a\":5,\"b\":[6,7,null]}}]")  

    expect(JSON.stringify(Optional(obj).flat(2))).toBe("[1,2,3,4,{\"a\":5,\"b\":[6,7,null]}]")  

    expect(JSON.stringify(Optional(obj).flat(3))).toBe("[1,2,3,4,5,[6,7,null]]")  

    expect(JSON.stringify(Optional(obj).flat(4))).toBe("[1,2,3,4,5,6,7]")  
    expect(JSON.stringify(Optional(obj).flat(5))).toBe("[1,2,3,4,5,6,7]") 
    expect(JSON.stringify(Optional(obj).flat(Infinity))).toBe("[1,2,3,4,5,6,7]") 

        
  });

  test('option extends unSafeItems', ()=>{

    const op1 = Optional([1,2,3,4,5,undefined,NaN,null],{
      unSafeItems:[
        1
      ]
    })

    //expected 1
    expect([...op1]).toStrictEqual([2,3,4,5,undefined,NaN,null])

    const op2 = Optional([1,2,3,4,5,undefined,NaN,null],{
      unSafeItems:[
        1
      ]
    }).extends() // extends default option

    //expected 1,undefined,NaN,null
    expect([...op2]).toStrictEqual([2,3,4,5])


    const op3 = Optional([1,2,3,4,5,undefined,NaN,null],{
      unSafeItems:[
        5
      ]
    }).extends(op2) // extends op2

    //expected 1,5,,undefined,NaN,null
    expect([...op3]).toStrictEqual([2,3,4])
    
  });

  test('option extends methodAlias', ()=>{

    const op1 = Optional([1,2,3,4,5,undefined,NaN,null],{
      methodAlias:{
        "hoge":()=>1
      }
    })

    expect(op1.hoge()).toBe(1)

    const op2 = Optional([1,2,3,4,5,undefined,NaN,null],{
      methodAlias:{
        "hoge":()=>2
      }
    }).extends(op1)

    expect(op2.hoge()).toBe(2) // priority  option of arg > extends

    const op3 = Optional([1,2,3,4,5,undefined,NaN,null],{
      methodAlias:{
        "hoge":()=>3
      }
    })

    const op4 = Optional([1,2,3,4,5,undefined,NaN,null]).extends(op1).extends(op3)
    expect(op4.hoge()).toBe(1) // priority  option of arg > extends op1 > extends op3
    
  });

  test('option extends illegal arg', ()=>{

    expect(()=>Optional([1]).extends("hogr")).toThrow(Error)
    expect(()=>Optional([1]).extends(1)).toThrow(Error)
    expect(()=>Optional([1]).extends(null)).toThrow(Error)
    expect(()=>Optional([1]).extends({a:1})).toThrow(Error)
    expect(()=>Optional([1]).extends([1])).toThrow(Error)
    
  });


});



