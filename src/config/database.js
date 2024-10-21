import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://marco:senha123@cluster0.hlpso.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log('Conectado ao banco de dados');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados', error);
        process.exit(1);
    }
};

export default connectDB;