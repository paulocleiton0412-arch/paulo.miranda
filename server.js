const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json());

const db = new sqlite3.Database('./database.db');

db.run(`
CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    status TEXT NOT NULL,
    prazo TEXT
)
`);

app.get('/tarefas', (req, res) => {
    db.all('SELECT * FROM tarefas', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

app.get('/tarefas/:id', (req, res) => {
    db.get(
        'SELECT * FROM tarefas WHERE id = ?',
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ erro: err.message });

            if (!row) {
                return res.status(404).json({
                    mensagem: 'Tarefa não encontrada'
                });
            }

            res.json(row);
        }
    );
});

app.post('/tarefas', (req, res) => {
    const { descricao, status, prazo } = req.body;

    db.run(
        'INSERT INTO tarefas (descricao, status, prazo) VALUES (?, ?, ?)',
        [descricao, status, prazo],
        function(err) {
            if (err) return res.status(500).json({ erro: err.message });

            res.status(201).json({
                id: this.lastID,
                descricao,
                status,
                prazo
            });
        }
    );
});

app.put('/tarefas/:id', (req, res) => {
    const { descricao, status, prazo } = req.body;

    db.run(
        'UPDATE tarefas SET descricao = ?, status = ?, prazo = ? WHERE id = ?',
        [descricao, status, prazo, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ erro: err.message });

            res.json({
                mensagem: 'Tarefa atualizada com sucesso'
            });
        }
    );
});

app.delete('/tarefas/:id', (req, res) => {
    db.run(
        'DELETE FROM tarefas WHERE id = ?',
        [req.params.id],
        function(err) {
            if (err) return res.status(500).json({ erro: err.message });

            res.json({
                mensagem: 'Tarefa removida com sucesso'
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
