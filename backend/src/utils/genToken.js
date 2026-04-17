import jwt from "jsonwebtoken";

const generateToken = (res,id)=>{
    const token = jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'30d'})

    res.cookie('jwt',token,{
        httpOnly:true,
        secure:true,
        sameSite:'none',
        maxAge:30*24*60*60*1000
    })
}
export default generateToken;