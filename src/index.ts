import { run, app } from './config/app'

run();

const PORT = process.env.PORT || 5000;

import galleryRouter from './routes/gallery';

app.use('/api/gallery', galleryRouter)

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`)
});
