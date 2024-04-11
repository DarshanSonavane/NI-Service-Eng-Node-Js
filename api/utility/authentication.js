const jwt = require('jsonwebtoken');
const constants = require('./constant');

const createToken = (customerCode)=>{
    try{
        const token = jwt.sign({ customerCode: customerCode , date: new Date() }, constants.NI_SERVICE_ENG_APP, {
            expiresIn: '10m',
        });
        return token;
    }catch(err){
        console.log('err',err);
    }
}

const authenticateToken =  (req, res, next)=> {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
     const decoded = jwt.verify(token, constants.NI_SERVICE_ENG_APP);
     req.customerCode = decoded.customerCode;
     next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    createToken : createToken,
    authenticateToken : authenticateToken,
}