const joi = require("joi")

const validateUser = async (req, res, next)=>{
    try{
        const userSchema = joi.object({
            username:joi.string().empty().required().messages({"string.base":`"username" must be of type "text"`,"string.empty":`"username" can not be empty`,"string.required": `"username" is required `}),
            password:joi.string().empty().required().min(8).messages({"string.base":`"password" must be of type "text"`,"string.empty":`"password" can not be empty`,
            "string.required": `"name" is required `,"string.min":`"password" should have a minimum length of {8}`}),
        })

        await userSchema.validateAsync(req.body, {abortEarly:true})
        next()
    }
    catch(error){
        res.render("credentialsError", {error:error.message, navs:["Signup", "Login"]})
    }
}

module.exports = {validateUser}