import jwt from "jsonwebtoken";

const generateTokens = (res, id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '14d' });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 14 * 24 * 60 * 60 * 1000 // 7 days
    });

    return accessToken;
}
export default generateTokens;