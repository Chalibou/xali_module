toolText = {
    mail_unaviable:(mail)=>`The mail ${mail} is already in use`
    ,register_success:()=>'Registration is sucessfull'
    ,wrong_user:(user)=>`Username ${user} is not registered in this platform`
    ,wrong_key:()=>"The password you have entered is not correct"
    ,low_accreditation:()=>"Your credential level does not allow you to access this request"
    ,hi:(name)=>`Hi ${name} how are you today ?`
    ,empty_fields:"Fill the fields you left empty"
    ,different_password:"Password typed are not the same"
    ,weak_password:"Your password must be at least 8 characters long, with number, special character, without space"
    ,lostPwd_success:"Your new password has been sent to your email"
    ,changePwd_success:"Your password has been changed sucessfully"
    ,error:(issue)=>{
        switch(issue.token){
            case "ukn_mail": return "The mail you entered is not recognized"
            case "getUser_error": return "The mail you entered is not recognized"
            default:return `An unknown error occured : ${JSON.stringify(issue)}`
        }
    },
    changePwd_success:'Your password was changed sucessfully'
}