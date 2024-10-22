import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado ao banco de dados');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados', error);
        process.exit(1);
    }
};

export default connectDB;