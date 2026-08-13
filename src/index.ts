import { run } from './config/app'
import express from 'express'
import path from 'path'
import galleryRouter from './routes/gallery';
import blogRouter from './routes/blog';
import loginRouter from './routes/auth';
export const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

run();

const PORT = process.env.PORT;


app.use('/api/gallery/', galleryRouter)
app.use('/api/blog', blogRouter)
// app.use('/api/login', loginRouter)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`)
});
