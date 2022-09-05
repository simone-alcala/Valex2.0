import { Router } from 'express';
import swaggerUI from 'swagger-ui-express';
import fs from 'fs';

const documentationRouter = Router();

const swaggerOptions = {
  swaggerOptions: {
    supportedSubmitMethods: []
  }
}

const swaggerFile: string = (process.cwd()+'/src/swagger/swagger.json');
const swaggerData: string = fs.readFileSync(swaggerFile, 'utf8');
const swaggerDocument = JSON.parse(swaggerData);

documentationRouter.use('/api-docs', swaggerUI.serve);
documentationRouter.get('/api-docs', swaggerUI.setup(swaggerDocument, swaggerOptions));

export default documentationRouter;