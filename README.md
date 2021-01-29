## This project is a  Rule Validator was built with Node.js

It has two endpoints:
- Get '/': 
    This returns a few data about myself

- POST '/validate-rule':
    This route must use accept a proper JSON object like;
    
    {
    "rule": {
        "field": "2",
        "condition": "contains",
        "condition_value": "a"
    },
    "data": "Helen of Troy"
    }

    or

    {
    "rule": {
        "field": "missions",
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
    }

    - rule and data fields are compulsory
    - all fields in the rule field are compulsory
    - the data could be an array, a string or an object