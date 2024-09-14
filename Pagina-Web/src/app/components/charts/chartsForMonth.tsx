"use client"

import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { DataObject } from "../util/interfaces";



const array:DataObject[] = []

var dateFinish = ''
var dateStart = ''
let hasDataChange:boolean = false;

export function DataSelectorStart() {
    // Estado para armazenar a data selecionada
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Manipulador de evento para a mudança na seleção da data
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
        var dataArray:string[] = (event.target.value.split("-")) ?? '';
        // Aqui você pode fazer o que quiser com a data selecionada, como enviar para a API, etc.
        dateStart = `${dataArray[2]}/${dataArray[1]}/${dataArray[0]}`;
    };

    return (
        <div className="flex items-center justify-center mb-2 mr-4">
        <label htmlFor="datePicker" className="text-black font-semibold text-xl mr-2">Selecione a data Inicial:</label>
        <input
            type="date"
            id="datePicker"
            name="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className=" py-1 text-center rounded-lg"
        />
        </div>
    );
}


export function DataSelectorFinish() {
    // Estado para armazenar a data selecionada
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Manipulador de evento para a mudança na seleção da data
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
        var dataArray:string[] = (event.target.value.split("-")) ?? '';
        // Aqui você pode fazer o que quiser com a data selecionada, como enviar para a API, etc.
        dateFinish = `${dataArray[2]}/${dataArray[1]}/${dataArray[0]}`;
    };

    return (
        <div className="flex items-center justify-center mb-2">
        <label htmlFor="datePicker" className="text-black  font-semibold text-xl mr-2">Selecione a data final:</label>
        <input
            type="date"
            id="datePicker"
            name="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className=" py-1 text-center rounded-lg"
        />
        <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg ml-2" onClick={() => {
                hasDataChange = true;
                if(!dateFinish){
                    alert("Selecione uma data final");
                    hasDataChange = false;
                }
                if(!dateStart) {
                    alert("Selecione uma data inicial");
                    hasDataChange = false;
                }
                

                router.refresh()}}>
                <FaSearch/>
            </button>
        </div>
        </div>
    );
}

export function ChartsForMonth() {

    const [data, setData] = useState(array);

    async function buscaDados() {
    
        try{
            fetch(`http://127.0.0.1:5000/data/month?dataStart=${dateStart}&dataFinish=${dateFinish}`)
            .then(res => { return res.json()})
            .then(data => {
                const dataArray: DataObject[] = Object.values(data);
                setData(dataArray)
            })
        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if(dateFinish.length == 10 && dateStart.length == 10){
            buscaDados();
        }
    },[])

    if(hasDataChange) {
        buscaDados();
        hasDataChange = false;
    }

    console.log(data);

    const dataPower:[number, number][] = []

    let sumValues = 0;

    var date = data[0]?.data;
    let dataDate = new Date(
        parseInt(data[0]?.ano),
        parseInt(data[0]?.mes)-1,
        parseInt(data[0]?.dia)
    ).getTime();


    for(let i = 0; i<data.length; i++) {
        if(data[i].data == date){
            sumValues += parseFloat(data[i]?.energia)
        } else {
            dataPower.push([dataDate, parseFloat((sumValues/1000).toFixed(2))])
            dataDate = new Date(
                parseInt(data[i]?.ano),
                parseInt(data[i]?.mes)-1,
                parseInt(data[i]?.dia)
            ).getTime()
            date = data[i]?.data;
            sumValues = parseFloat(data[i]?.energia)
        }
    }

    if (sumValues > 0) {
        dataPower.push([dataDate, parseFloat((sumValues/1000).toFixed(2))]);
    }
        

    const options:ApexOptions = {
        chart: {
            id: "basic-bar",
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Dias"
            }
        },
        noData: {
            text: "Carregando...",
            align: "center",
            verticalAlign: "middle",
        },
        yaxis:{
            title:{
                text:"Geração"
            }
        }, 
    }

    const series:ApexAxisChartSeries = [
        {
            name:"kWh",
            data: dataPower
        }
    ]

    return (
        <div className="">
                <div className="bg-white flex-col ">
                    <div className="items-center justify-center text-center font-semibold text-lg">ENERGIA GERADA (kWh)</div>
                    <Chart
                        type="bar"
                        options={options}
                        series={series}
                        width="100%"
                        height="350vh"
                    />
                </div>
        </div>
        
    )
}
