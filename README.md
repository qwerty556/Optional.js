# Optional.js
    -------------|---------|----------|---------|---------|-------------------
    File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
    -------------|---------|----------|---------|---------|-------------------
    All files    |     100 |      100 |     100 |     100 | 
    Optional.js  |     100 |      100 |     100 |     100 | 
    -------------|---------|----------|---------|---------|-------------------

    coverage 100%!!
# demo
    const obj = {
        a:[1,2,{a:"aa"}],
        b:{a:"ba",b:undefined}
    }

    Optional(obj).getOrElse("a[0]","none") // 1
    Optional(obj).getOrElse("a[1]","none") // 2
    Optional(obj).getOrElse("a[2]","none") // {a:"aa"}
    Optional(obj).getOrElse("a[2].a","none") // "aa"
    Optional(obj).getOrElse("b.b","none") // "none"

    Optional(obj).getOrElse("a[3]","none") // "none"
    Optional(obj).getOrElse("a[3]",(obj)=>"none") // "none"


    const user = {
        name:"uma",
        action:{
            login:()=>"login_proc"
        }
    }

    Optional(user).getOrElse("action.login()","none") // "login_proc"
    Optional(user).getOrElse("action.logout()","none") // "none"



    const array = [
        1,2,3,undefined,NaN,null,4,5
    ]

    [...Optional(array)].join("") // "12345"

    for(const safeItem of Optional(array)){
        console.log(safeItem) // 1 2 3 4 5
    }

    const obj2 = {
        a:1,b:2,c:3,d:undefined,e:NaN,f:null,g:4,i:5
    }

    [...Optional(obj2)].join("") // "12345"

    for(const safeItem of Optional(obj2)){
        console.log(safeItem) // 1 2 3 4 5
    }

# document
    @see src/Optional.test.js

# npm
    coming soon

# test run
    git clone {this} 
    npm install
    npm test



# memo
    reference sites
        https://qiita.com/riversun/items/6c30a0d0897194677a37