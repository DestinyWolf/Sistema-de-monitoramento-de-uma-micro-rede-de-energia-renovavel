"use client"
import {useState } from "react";
import { DataObject } from "./interfaces";
import clsx from "clsx";

//funções relacionadas a barra de tarefas e exibição de dados

//busca dados da api 
async function fetchFromApi() {
    return  fetch("http://127.0.0.1:5000/data/ischange")
            .then(res => { return res.json()})
            .then(data => {return data})
}

let previousData: any = null; //ultimo busca realizada onde houve alteração
let status:boolean = true; //status de alteração de dados
var gdata:string|undefined; //guarda a ultima data que tem no banco de dados

//realiza a busca na api, verifica se houve alguma alteração e atualiza os dados
async function checkForUpdateAndFetchData() {
    const currentData = await fetchFromApi();

    // Verificar se é a primeira vez que os dados são verificados
    if (!previousData) {
        previousData = currentData;
        return;
    }

    // Comparar os dados atuais com os dados anteriores
    const isUpdated = JSON.stringify(currentData) !== JSON.stringify(previousData);

    if (isUpdated) {
        // Atualizar os dados anteriores
        previousData = currentData;

        status = true
    } else {
        status = false
    } 
}

//realiza a chamada do metodo de verificao a cada um minuto
setInterval(checkForUpdateAndFetchData, 60000);

//exibe os ultimos dados salvos no banco de dados, alem de fazer a somatoria do valor total da energia
export function LastDateInApi() {

    const array:DataObject[] = [];
    const [dados, setDados] = useState(array); 
    
        //busca os dados na api e salva na constante dados
        async function buscaDados() {
    
            try{
                fetch("http://127.0.0.1:5000/data/last")
                .then(res => { return res.json()})
                .then(data => {
                    const dataArray: DataObject[] = Object.values(data);
                    setDados(dataArray)
                })
            } catch(err) {
                console.log(err)
            }
        }
        if(status) {
            buscaDados();
            status = false;
        } else if(!dados.length){
            buscaDados();
            status = false;
        }
    
    var energia = 0.0; 
    var data:string|undefined = dados[dados.length -1]?.data
    gdata = data;
    for (let i = 0; i < dados.length; i++){
        if(dados[i].data == data)
            energia += parseFloat(dados[i].energia);
    }
    

    return (
        <div className="flex-col justify-center items-center align-top text-center">
            <h1 className="mb-3 text-black text-lg font-bold">ULTIMOS DADOS</h1>
            <div className="text-black font-semibold mt-auto mb-4">{`Dia ${dados[dados.length - 1]?.data}`}</div>
            <div className="flex mb-3 justify-center items-center">
                <div className="ml-2 mr-2 border-4 p-6 font-bold text-center border-emerald-700 bg-white rounded-xl">
                    {`Potência (W): ${(dados[dados.length-1]?.potencia) ? dados[dados.length-1]?.potencia:0}`}
                </div>

                <div className="ml-2 mr-2 border-4 p-6 font-bold text-center border-orange-400 bg-white rounded-xl">
                    {`Temperatura da Placa (°C): ${(dados[dados.length-1]?.tempB) ? dados[dados.length-1]?.tempB:0}`}
                </div>
                
                <div className="ml-2 mr-2 border-4 p-6 font-bold text-center border-cyan-900 bg-white rounded-xl">
                    {`Temperatura Ambiente (°C): ${(dados[dados.length-1]?.tempA) ? dados[dados.length-1]?.tempA:0}`}
                </div>

                <div className="ml-2 mr-2 border-4 p-6 font-bold text-center border-cyan-400 bg-white rounded-xl">
                    {`Geração do dia (kWh): ${(energia/1000).toFixed(2)}`}
                </div>
            </div>
            
            


        </div>
    );
}

//faz a verificação de houve altualização na ultima hora e exibe se o sistema esta ligado ou não
export function StatusBar() {

    if(gdata == undefined){
        gdata = '01/00/2000';
    }

    var date = new Date();
    var lastDateUpdate = new Date(parseInt(gdata.slice(6)), parseInt(gdata.slice(3,5))-1, parseInt(gdata.slice(0,2)));
    var status = "Desligado";

    if(date > lastDateUpdate){
        status = "Desligado"
    } else {
        status = "Ligado"
    }

    const bgClass = clsx({
        'bg-red-500': status === "Desligado",
        'bg-green-500': status === "Ligado",
    })

    return (
        <div className="flex justify-center items-center">
            <p className="text-white font-semibold">{status}</p>
            <div className={clsx('ml-3 border-2 border-black rounded-full w-6 h-6 mr-1', bgClass)}></div>
        </div>
    );
}
