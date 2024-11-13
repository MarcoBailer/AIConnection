import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const publicKey = fs.readFileSync('assets/keys/public.key', 'utf8');

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }
  
  jwt.verify(token, publicKey,{algorithms: ['RS256']}, (err, decoded) => {
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
