const express = require("express");
//o V4 gera os IDs randomicamente
const { v4: uuidv4 } = require("uuid");

const app = express();

//para o express interpretar json
app.use(express.json());

//criando array onde será salvo os objetos
const customers = [];

//Middleware
function verificaExisteCpf(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

/**
 * cpf = string
 * name - string
 * id - uuid
 * statment []
 */

//Realizando post
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  //validando se um dado já tem no banco
  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  //Se CPF já for existente, apresente erro.
  if (customerAlreadyExists) {
    return response.status(400).json({ erro: "Customer already exists!" });
  }

  //inserindo/salvando
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  //retorno do método
  return response.status(201).send();
});

//Se você precisa que todas as rotas verifiquem se tem CPF, o middleware verificaExisteCpf dever ser passado confoeme exemplo abaixo
//app.use(verificaExisteCpf);

//método get para pegar informação do extrato, por um request router
// app.get("/statement/:cpf", (request, response)=>{
//     const { cpf } = request.params;

//     const customer = customers.find((customer) => customer.cpf === cpf);

//     if(!customer){
//         return response.status(400).json({error: "Customer not found"})
//     }

//     return response.json(customer.statement);
// });

//Fazendo get com um request body.
app.get("/statement", verificaExisteCpf, (request, response) => {
  const { customer } = request;
  // const { cpf } = request.headers;

  // const customer = customers.find((customer) => customer.cpf === cpf);

  // if(!customer){
  //     return response.status(400).json({error: "Customer not found"})
  // }

  return response.json(customer.statement);
});

app.post("/deposito", verificaExisteCpf, (request, response) => {
    const {descricao, montante} = request.body;

    const { customer}= request;

    const operacao = {
        descricao,
        montante,
        criadoEm: new Date(),
        tipo: "credito"
    }

    customer.statement.push(operacao);

    return response.status(201).send();
});

app.listen(3333);
