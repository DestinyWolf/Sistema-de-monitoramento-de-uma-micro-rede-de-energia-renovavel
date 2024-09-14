'use client'
import { ApexOptions } from "apexcharts";
import {DataObject} from "../util/interfaces";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

async function fetchFromApi(url:string)  {
    return  fetch(url)
            .then(res => { return res.json()})
            .then(data => {return data})
}

//variaveis para a valicação de alterações no banco de dados
let previousData:any;
let status:boolean = false

async function checkForUpdateAndFetchData() {
    const currentData = await fetchFromApi("http://127.0.0.1:5000/data/ischange");

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
        console.log("Os dados não foram atualizados. Não é necessário fazer a solicitação à API.");
        status = false
    } 
}

// Executar a função de verificação a cada 60 segundos
setInterval(checkForUpdateAndFetchData, 60000);

const array:DataObject[] = []; //array global para armazenar as informações iniciais dos graficos

export function VoltageChart() {

    //armazena os dados vindo da API
    const [dados, setDados] = useState(array); 
    //faz o fetch na api
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
        
    //faz a requeisação na api sempre que o componente for renderizado
    useEffect(() => {
        buscaDados();
    },[]);

    if(status){
        status=false
        buscaDados()
    } 

    var lastDayDate = dados[dados.length-1]?.data ? dados[dados.length-1]?.data : null;

    const data = []

    if (lastDayDate) {
        for(let i = 0; i<dados.length; i++) {
            if (dados[i]?.data == lastDayDate) {
                let date = new Date(
                    parseInt(dados[i]?.ano),
                    parseInt(dados[i]?.mes)-1,
                    parseInt(dados[i]?.dia),
                    parseInt(dados[i]?.hora)-3,
                    parseInt(dados[i]?.tempo.slice(3,5))).getTime();
                data.push([date, parseFloat(dados[i]?.tensao)]);
            }
        }
    } 

    const options:ApexOptions = {
        chart: {
            id: "area"
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Tempo"
            }
        },
        dataLabels:{
            enabled:false
        },
        yaxis:{
            title:{
                text:"Tensão"
            }
        },
        tooltip:{
            x:{
                format: "dd/MM/yy HH:mm"
            }
        },
        colors:["#FF1654"]
    }

    const series:ApexAxisChartSeries = [
        {
            name: 'V',
            data: data
        }
    ]
    
    //exibe o grafico na tela
    return (
        <div className="">
            <div className="items-center justify-center text-center font-semibold text-lg mt-2">Grafico Tensão (V)</div>
                <div className="bg-white">
                    <Chart
                        type="area"
                        options={options}
                        series={series}
                        width="100%"
                        height="350vh"
                    />
                </div>
        </div>
        
    )

}

export function EletricCurrentChart() {

    
    const [dados, setDados] = useState(array); 

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

    //faz a requeisação na api sempre que o componente for renderizado
    useEffect(() => {
        buscaDados();
    },[]);

    //se houve atualização no banco de dados, faz a requizição na api
    if(status){
        buscaDados();
        status = false;
    }
    

    var lastDayDate = dados[dados.length-1]?.data ? dados[dados.length-1]?.data : null;

    const data = []

    if (lastDayDate) {
        for(let i = 0; i<dados.length; i++) {
            if (dados[i]?.data == lastDayDate ) {
                let date = new Date(
                    parseInt(dados[i]?.ano),
                    parseInt(dados[i]?.mes)-1,
                    parseInt(dados[i]?.dia),
                    parseInt(dados[i]?.hora)-3,
                    parseInt(dados[i]?.tempo.slice(3,5))).getTime(); //criação de uma data
                data.push([date, parseFloat(dados[i]?.corrente)]);
            }
        }

        
    }   

    const options:ApexOptions = {
        chart: {
            id: "basic-bar"
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Horas"
            }, 
        },
        noData: {
            text: "Carregando...",
            align: "center",
            verticalAlign: "middle",
        },
        legend:{
            show: true,
            position: "bottom"
        },
        dataLabels:{
            enabled: false
        },
        yaxis:{
            title:{
                text:"Corrente"
            }
        },
        tooltip:{
            x:{
                format: "dd/MM/yy HH:mm"
            }
        },
        colors:["#247BA0"]
        
    }

    const series:ApexAxisChartSeries = [
        {
            name: 'A',
            data: data
        }
    ]

    //exibe o grafico na tela
    return (
        <div className="-z-10">
            <div className="-z-10">
                <div className="bg-white">
                <div className="items-center justify-center text-center font-semibold text-lg">Grafico Corrente (A)</div>
                <Chart
                    type="area"
                    options={options}
                    series={series}
                    width="100%"
                    height="350vh"
    
                />
                </div>
                
            </div>
        </div>
            
        
    )

}

export function TempChart() {

    
    const [dados, setDados] = useState(array); 

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
        
    if(status){
        status=false
        buscaDados()
    } 
    if (dados.length == 0) {
        buscaDados()
    }

    var lastDayDate = dados[dados.length-1]?.data ? dados[dados.length-1]?.data : null;

    const data1 = []
    const data2 = [] 
    

    if (lastDayDate) {

        for(let i = 0; i<dados.length; i++) {
            if (dados[i]?.data == lastDayDate ) {
                let date = new Date(
                    parseInt(dados[i]?.ano),
                    parseInt(dados[i]?.mes)-1,
                    parseInt(dados[i]?.dia),
                    parseInt(dados[i]?.hora)-3,
                    parseInt(dados[i]?.tempo.slice(3,5))).getTime()
                data1.push([date, parseFloat(dados[i]?.tempA)]);
                data2.push([date, parseFloat(dados[i]?.tempB)]);
        }
    }
        
    } 

    const options:ApexOptions = {
        chart: {
            id: "basic-bar"
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Tempo"
            }
        },
        dataLabels:{
            enabled:false
        },
        yaxis:{
            title:{
                text:"Temperatura"
            }
        },
        tooltip:{
            x:{
                format: "dd/MM/yy HH:mm"
            }
        },
        colors:["#fb923c"]
    }

    const optionsAlternative:ApexOptions = {
        chart: {
            id: "basic-bar"
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Tempo"
            }
        },
        dataLabels:{
            enabled:false
        },
        yaxis:{
            title:{
                text:"Temperatura"
            }
        },
        tooltip:{
            x:{
                format: "dd/MM/yy HH:mm"
            }
        },
        colors:["#164e63"]
    }

    const series:ApexAxisChartSeries = [
        {
            name: '°C',
            data: data1
        }
    ]

    const series2:ApexAxisChartSeries = [
        {
            name: '°C',
            data: data2
        }
    ]

    //exibe o grafico na tela
    return (
        <div className="">
            <div className="bg-white flex">
                <div className="w-1/2">
                    <div className="items-center justify-center text-center font-semibold text-lg">Temperatura do Ambiente (°C)</div>
                    <Chart
                        type="area"
                        options={options}
                        series={series}
                        width="100%"
                        height="350vh"
                    />
                </div>
                <div className="w-1/2">
                    <div className="items-center justify-center text-center font-semibold text-lg">Temperatura da Placa (°C)</div>
                    <Chart
                        type="area"
                        options={optionsAlternative}
                        series={series2}
                        width="100%"
                        height="350vh"
                    />
                </div>
            </div>
        </div>
    )

}

export function PowerChart() {

    
    const [dados, setDados] = useState(array); 

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
    
    useEffect(()=>{
        buscaDados();
    },[]);

    if (status) {
        buscaDados();
    }
    

    var lastDayDate = dados[dados.length-1]?.data ? dados[dados.length-1]?.data : null;

    const data = []

    if (lastDayDate) {

        for(let i = 0; i<dados.length; i++) {
            if (dados[i]?.data == lastDayDate ) {
                let date = new Date(
                    parseInt(dados[i]?.ano),
                    parseInt(dados[i]?.mes)-1,
                    parseInt(dados[i]?.dia),
                    parseInt(dados[i]?.hora)-3,
                    parseInt(dados[i]?.tempo.slice(3,5))).getTime();
                data.push([date, (parseFloat(dados[i]?.potencia)/1000)]);
            }
        }

        
    } 

    const options:ApexOptions = {
        chart: {
            id: "basic-bar"
        },
        xaxis:{
            type: "datetime",
            title:{
                text: "Horas"
            }
        },
        dataLabels:{
            enabled:false
        },
        yaxis:{
            title:{
                text:"KiloWatts"
            }
        },
        tooltip:{
            x:{
                format: "dd/MM/yy HH:mm"
            }
        },
        colors:['#2e9623']
    }

    const series:ApexAxisChartSeries = [
        {
            name: 'Kwh',
            data: data
        }
    ]
    //exibe o grafico na tela
    return (
        <div className="">
            <div className="bg-white">
                <div className="items-center justify-center text-center font-semibold text-lg">Grafico Potencia (kW)</div>
                    <Chart
                        type="area"
                        options={options}
                        series={series}
                        width="100%"
                        height="350vh"
        
                    />
                </div>
        </div>
        
    )

}


export function CurrentxVoltageChart() {
    const [dados, setDados] = useState(array); 
    const [type, setTypeView] = useState("juntos");
    

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
        
    if(status){
        status=false
        buscaDados()
    } 
    if (dados.length == 0) {
        buscaDados()
    }

    var lastDayDate = dados[dados.length-1]?.data ? dados[dados.length-1]?.data : null;

    const data1 = []
    const data2 = []
    if (lastDayDate) {
        for(let i = 0; i<dados.length; i++) {
            if (dados[i]?.data == lastDayDate ) {
                let date = new Date(
                    parseInt(dados[i]?.ano),
                    parseInt(dados[i]?.mes)-1,
                    parseInt(dados[i]?.dia),
                    parseInt(dados[i]?.hora)-3,
                    parseInt(dados[i]?.tempo.slice(3,5))).getTime();
                data1.push([date, parseFloat(dados[i]?.corrente)]); 

                data2.push([date, parseFloat(dados[i]?.tensao)]);
            }
        }

        
    }   

    const options:ApexOptions = {
        chart: {
            id: "line"
        },
        xaxis:{
            type: "datetime",
            title:{
                text: "Horas",
                
            },
            axisBorder:{
                show:true,
                color: "#00FFFF"
            },
            axisTicks: {
                show:true
            }
        },
        tooltip:{
            x:{
                format: "dd/MM/yy HH:mm"
            }
        },
        yaxis: [
            {
                axisTicks: {
                    show: true
                },
                axisBorder: {
                    show: true,
                    color: "#FF1654"
                },
                labels: {
                    style: {
                        colors: "#FF1654"
                    }
                },
                title: {
                    text: "Voltagem",
                    style: {
                        color: "#FF1654"
                    }
                }
            },
            {
                opposite: true,
                axisTicks: {
                    show: true
                },
                axisBorder: {
                    show: true,
                    color: "#247BA0"
                },
                labels: {
                    style: {
                        colors: "#247BA0"
                    }
                },
                title: {
                    text: "Corrente",
                    style: {
                        color: "#247BA0"
                    }
                }
            }
            ],
        noData: {
            text: "Carregando...",
            align: "center",
            verticalAlign: "middle",
        },
        legend:{
            show: true
        },
        dataLabels:{
            enabled: false
        },
        colors: ["#FF1654", "#247BA0"],

        stroke: {
            curve: 'smooth'
        },

        fill:{
            type: 'solid',
            opacity:[0.35, 0.9]
        }
    }

    const series:ApexAxisChartSeries = [
        {
            name: 'Volts',
            data: data2,
            type: "area"
        }, 
        {
            name: 'Amper',
            data: data1,
            type:"line"
        }
    ]

    //exibe o grafico na tela
    return (
        <div className="-z-10">
            <div className="-z-10">
                <div className="items-center justify-center text-center">
                    <button 
                        className="rounded-full bg-white m-2 p-3 font-semibold hover:bg-slate-400 hover:border-blue-500 focus:bg-emerald-800 transition"
                        onClick={() => setTypeView("juntos")}
                    >
                        JUNTOS
                    </button>

                    <button 
                        className="rounded-full bg-white m-2 p-3 font-semibold hover:bg-slate-400 hover:border-blue-500 focus:bg-emerald-800 transition"
                        onClick={() => setTypeView("separados")}
                    >
                        SEPARADOS
                    </button>

                </div>
                
                <div className="bg-white">
                
                    {(type == "juntos") && (
                        <>
                            <div className="items-center justify-center text-center font-semibold text-lg">Tensão (V) x Corrente (A)</div>
                            <Chart
                            type="line"
                            options={options}
                            series={series}
                            width="100%"
                            height="350vh"
                            />
                        </>
                    )}
                    {(type == "separados") && (
                        <div className="flex">
                            <div className="w-1/2">
                                <EletricCurrentChart/>
                            </div>
                            <div className="w-1/2">
                                <VoltageChart/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}