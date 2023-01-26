const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');


const couch = new NodeCouchDb({
    auth : {
        user:'admin',
        pass:'admin'
    }
});

const dbName = 'projet';
const viewUrl = '_design/tous_les_clients/_view/tous';

couch.listDatabases().then(function(dbs){
    console.log(dbs);
});


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req, res){
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
            res.render('index',{
                clients : data.data.rows
            });
            

        },
        function(err){
            res.send(err);

        }
    );
});

app.post('/client/add', function(req,res){
    const nom = req.body.nom;
    const email = req.body.email;
    
    couch.uniqid().then(function(ids){
        const id = ids[0];
        couch.insert(dbName,{
            _id:id,
            nom:nom,
            email:email
        }).then(
            function(data, headers, status){
                res.redirect('/');
            },
            function(err){
                res.send(err);
            }
        );
    });

});

app.post('/client/delete/:id', function(req,res){
    const id = req.params.id;
    const rev = req.body.rev;

    couch.del(dbName, id, rev).then(
        function(data, headers, status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        });

});

/*app.put('/client/update/:id', function(req,res){
    const id = req.params.id;
    const nom = req.body.nom;
    const email = req.body.email;
    console.log(id.name.email);

    couch.update(dbName, {nom:nom,email:email}).then(
        function(data, headers, status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        });

});*/

app.listen(3000,function(){
    console.log('server started on port 3000');
});
