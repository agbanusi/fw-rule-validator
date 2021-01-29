const express = require('express')
const app = express()
app.use(express.json())

app.get('/',(req,res)=>{
    res.json({
        name: "John Agbanusi",
        github: "@agbanusi",
        email: "agbanusijohn@gmail.com",
        mobile: "08073975086",
        twitter: "@agbanusijohn"
    })
})

app.get('/validate-rule', (req,res)=>{
    res.send(`You're almost there! Please go through the POST method to request at this endpoint and in this format  {
        "rule": {
          "field": "missions"
          "condition": "gte",
          "condition_value": 30
        },
        "data": {
          "name": "James Holden",
          "crew": "Rocinante",
          "age": 34,
          "position": "Captain",
          "missions": 45
        }
      }`)
})

app.post('/validate-rule', check, validate_data, validate_rule, 
        validate_rule_fields, conditions, check_field_obj, check_field_array,
         check_field_string, absolute_verify, prevalidate, (req, res, next)=>{

    let user = req.body
    let {field, condition, condition_value} = user.rule

    let ress = validate(condition, user.data[field], condition_value)
    if(ress){
        res.json({
            "message": `field ${field} successfully validated.`,
            "status": "success",
            "data": {
              "validation": {
                "error": false,
                "field": field,
                "field_value": user.data[field],
                "condition": condition,
                "condition_value": condition_value
              }
            }
          })
    }else{
        res.status(400).json({
            "message": `field ${field} failed validation.`,
            "status": "error",
            "data": {
              "validation": {
                "error": false,
                "field": field,
                "field_value": user.data[field],
                "condition": condition,
                "condition_value": condition_value
              }
            }
          })
    }
    
    
})

app.use(function (err, req, res, next) {
    let message = err.toString().split("\n")[0];
    return res.status(500).json({
        "message": `An error occured, please check your input data again: ${message}.`,
        "status": "error",
        "data": null
    })
  })

// Validate function
function validate(type, data1, data2){
    var answer = false
    switch(type){
        case "eq":
            if(data1 === data2){
                answer = true
            }
            break;
        case "neq":
            if(data1 !== data2){
                answer = true
            }
            break;
        case "gt":
            if(data1 > data2){
                answer = true
            }
            break;
        case "gte":
            if(data1 >= data2){
                answer = true
            }
            break
        default:
            answer = data1.includes(data2)

    }
    return answer
}

//Precheck and validate middleware
function prevalidate(req, res, next){
    let user = req.body
    let {field, condition, condition_value} = user.rule
    if(condition.trim() == 'eq' || condition.trim() == 'neq' || condition.trim() == 'contains'){
        next()
        return
    }

    if(!isNaN(condition_value) && !isNaN(req.body.data[field])){
        next()
        return
    }

    res.status(400).json({
        "message": "Invalid JSON payload passed.",
        "status": "error",
        "data": null
      })
}

// Check if data and rule exists middleware
function check(req,res, next){
    if(req.body.data && req.body.rule){
        next()
        return
    }else{
        if(req.body.rule){
            res.status(400).json({
                "message": "data is required.",
                "status": "error",
                "data": null
              })
        }else{
            res.status(400).json({
                "message": "rule is required.",
                "status": "error",
                "data": null
            })
        }
    }

}

//Validate data datatype in the request middleware
function validate_data(req, res, next){
    if(typeof req.body.data == 'string' || typeof req.body.data == 'object'){
        next()
        return
    }
    res.status(400).json({
        "message": "data should be a string, array or object.",
        "status": "error",
        "data": null
      })
}

// Validate the datatype for rule middlware
function validate_rule(req, res, next){
    if(typeof req.body.rule == 'object'){
        next()
        return
    }
    res.status(400).json({
        "message": "field should be an object.",
        "status": "error",
        "data": null
      })
}

// Validate the fields in the rules being complete middleware
function validate_rule_fields(req, res, next){
    let rule = req.body.rule
    let items = ['field','condition','condition_value']
    let abs = []
    if( items.every(i=> {
            if(Object.keys(rule).includes(i)){
                return true
            }
            abs.push(i)
            return false
            }) 
        ){
        next()
        return
    }else{
        res.status(400).json({
            "message": abs[0]+" is required.",
            "status": "error",
            "data": null
        })
    }
}

// Validate the conditions to be received middleware
function conditions(req,res,next){
    let {condition} = req.body.rule
    let cond = ['eq','neg','gt','gte', 'contains']
    let ress = cond.some(i=> condition.trim() == i)

    if(ress){
        next()
        return
    }else{
        res.status(400).json({
            "message": "Invalid JSON payload passed.",
            "status": "error",
            "data": null
        })
    }
}

// Check if it's an object data and validate it with the field in rule middleware
function check_field_obj(req, res, next){
    let field = req.body.rule.field
    let data = req.body.data
    
    if(Array.isArray(data) || (typeof data === 'string' || data instanceof String)){
        next()
        return
    }

    try{
        let keys = Object.keys(data)
        let ress = keys.includes(field.trim())

        if(ress){
            req.fieldChecked = true
            next()
            return
        }else{
            res.status(400).json({
                "message": `field ${field} is missing from data.`,
                "status": "error",
                "data": null
            })
        }
    }catch(e){
        res.status(400).json({
            "message": "Invalid JSON payload passed.",
            "status": "error",
            "data": null
          })
    }
}

//Check if it's an array and validate against the field column middleware
function check_field_array(req, res, next){
    let field = req.body.rule.field
    let data = req.body.data
    
    if(req.fieldChecked){
        next()
        return
    }

    if(typeof data === 'string' || data instanceof String){
        next()
        return
    }

    if( !isNaN(field)){
        if(field < data.length){
            req.fieldChecked = true
            next()
            return
        }else{
            res.status(400).json({
                "message": `field ${field} is missing from data.`,
                "status": "error",
                "data": null
              })
        }
    }else{
        res.status(400).json({
            "message": "Invalid JSON payload passed.",
            "status": "error",
            "data": null
          })
    }
}

//Check if it's a string and validate against the field column middleware
function check_field_string(req,res,next){
    let field = req.body.rule.field
    let data = req.body.data

    if(req.fieldChecked){
        next()
        return
    }

    if( !isNaN(field)){
        if(field < data.length){
            req.fieldChecked = true
            next()
            return
        }else{
            res.status(400).json({
                "message": `field ${field} is missing from data.`,
                "status": "error",
                "data": null
              })
        }
    }else{
        res.status(400).json({
            "message": "Invalid JSON payload passed.",
            "status": "error",
            "data": null
          })
    }

}

function absolute_verify(req, res, next){
    if(req.fieldChecked){
        next()
        return
    }
    res.status(400).json({
        "message": "Invalid JSON payload passed.",
        "status": "error",
        "data": null
      })
}

//listener
app.listen(5000, ()=>{
    console.log("listening at port 5000")
})