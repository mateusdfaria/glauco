const fs = require('fs');
const winston = require('winston');
const path = require('path');
const readline = require('readline');


const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        critical: 4
    },
    colors: {
        critical: 'red'
    }
};

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} - ${level.toUpperCase()} - ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: path.join('logs', 'app.log') })
    ],
});

winston.addColors(customLevels.colors);


function criarCadastro(email, senha) {
    const usuarios = carregarUsuarios();
    if (usuarios[email]) {
        logger.warn(`Tentativa de cadastro com email já existente: ${email}`);
        console.log('Email já cadastrado.');
        return;
    }
    usuarios[email] = { senha };
    salvarUsuarios(usuarios);
    logger.info(`Novo usuário cadastrado com sucesso: ${email}`);
    console.log('Cadastro realizado com sucesso.');
}


function fazerLogin(email, senha) {
    const usuarios = carregarUsuarios();
    if (!usuarios[email]) {
        logger.error(`Tentativa de login falhou: email não encontrado - ${email}`);
        console.log('Email não encontrado.');
        return;
    }
    if (usuarios[email].senha !== senha) {
        logger.warn(`Tentativa de login falhou: senha incorreta para o email - ${email}`);
        console.log('Senha incorreta.');
        return;
    }
    logger.info(`Usuário logado com sucesso: ${email}`);
    console.log('Login realizado com sucesso.');
}


function carregarUsuarios() {
    if (!fs.existsSync('users.json')) {
        return {};
    }
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
}


function salvarUsuarios(usuarios) {
    fs.writeFileSync('users.json', JSON.stringify(usuarios, null, 2));
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function iniciarPrograma() {
    rl.question('Você deseja [1] Criar Cadastro ou [2] Fazer Login? ', (opcao) => {
        if (opcao === '1') {
            rl.question('Digite seu email: ', (email) => {
                rl.question('Digite sua senha: ', (senha) => {
                    criarCadastro(email, senha);
                    rl.close();
                });
            });
        } else if (opcao === '2') {
            rl.question('Digite seu email: ', (email) => {
                rl.question('Digite sua senha: ', (senha) => {
                    fazerLogin(email, senha);
                    rl.close();
                });
            });
        } else {
            logger.warn('Opção inválida escolhida pelo usuário.');
            console.log('Opção inválida.');
            rl.close();
        }
    });
}

iniciarPrograma();
