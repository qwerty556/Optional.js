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
    expect(Optional(obj1).getOrElse("name","lostName1")).toBe("obj1");
    expect(Optional(obj1).getOrElse(" name","lostName1")).toBe("obj1");
    expect(Optional(obj1).getOrElse("name ","lostName1")).toBe("obj1");
    expect(Optional(obj1).getOrElse(".name ","lostName1")).toBe("obj1");
    expect(Optional(obj1).getOrElse("['name'] ","lostName1")).toBe("obj1");

    expect(Optional(obj1).getOrElse("name",()=>"lostName1")).toBe("obj1");
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

    expect(Optional(obj1).get("","lostObj1").unwrapping()).toStrictEqual(obj1);
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
    let array1 = [1,2,3,undefined,null,NaN,4,5,7,7]
    let op1 = Optional(array1,{
      unSafeItems:[1,2,3,(any)=>any===7]
    })
    //excepted 1,2,3,7
    expect([...op1]).toStrictEqual([undefined,null,NaN,4,5])


    let array2 = [1,2,3,undefined,null,NaN,4,5,7]
    let op2 = Optional(array2,{
      unSafeItems:[1,2,3,(any)=>any===7] 
        .concat(Optional().unSafeItems()) 
    })

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
    expect(obj30).toStrictEqual(clone)
  });

  test('illegal_args', ()=>{

    expect(()=>Optional([1,2,3,4,5]).getOrElse(1,"")).toThrow(Error)
    expect(()=>Optional([1,2,3,4,5]).getOrElse(["a"],"")).toThrow(Error)
    expect(()=>Optional([1,2,3,4,5]).getOrElse({a:1},"")).toThrow(Error)
    expect(()=>Optional([1,2,3,4,5]).getOrElse(true,"")).toThrow(Error)

  });

  test('optional wrapping is single wrap', ()=>{

    const wrap = Optional([1,2,3,4,5])
    const wrapWrap = Optional(Optional([1,2,3,4,5]))
    expect(wrapWrap).toStrictEqual(wrap)

  });

  test('optional wrapping is single wrap', ()=>{

    expect(Optional([1,2,3,4,5]).getOrElse("","none")).toStrictEqual([1,2,3,4,5])
    expect(Optional([1,2,3,4,5]).getOrElse(" ","none")).toStrictEqual([1,2,3,4,5])

  });



});



