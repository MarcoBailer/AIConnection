import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config({ path: '.env.local' });

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }
  
  const secret = process.env.JWT_SECRET;

  jwt.verify(token, secret, (err, decoded) => {
    console.log('Token recebido:', token);
    console.log('Segredo usado:', secret);
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }

    // Extrair o userId a partir da claim específica
    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (!userId) {
      return res.status(400).json({ error: 'userId não encontrado no token.' });
    }

    req.user = { userId };
    console.log('userId extraído:', req.user.userId);
    next();
  });
};
