"use client"

import { useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import {DataObject} from "../util/interfaces";
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { ApexOptions } from 'apexcharts';


let hasChangeDate:boolean = false;
export function DataSelector() {
    // Estado para armazenar a data selecionada
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Manipulador de evento para a mudança na seleção da data
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
        var dataArray:string[] = (event.target.value.split("-")) ?? '';
        // Aqui você pode fazer o que quiser com a data selecionada, como enviar para a API, etc.
        date = `${dataArray[2]}/${dataArray[1]}/${dataArray[0]}`;
        
    };

    return (
        <div className="flex items-center justify-center mb-2">
        <label htmlFor="datePicker" className="text-black font-semibold text-xl mr-2">Selecione uma data:</label>
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
                hasChangeDate = true;
                if(!selectedDate){
                    alert("Selecione uma data")
                    hasChangeDate = false;
                }
                router.refresh();
                }}>
                <FaSearch/>
            </button>
        </div>
        </div>
    );
}

const array:DataObject[] = []; 
let date = '';

export function ChartsForDay() {
    const [data, setData] = useState(array);

    async function buscaDados() {
    
        try{
            fetch(`http://127.0.0.1:5000/data/day?data=${date}`)
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
        if(date.length == 10)
            buscaDados();
        hasChangeDate = false;
    }, []);

    if(hasChangeDate){
        buscaDados();
        hasChangeDate = false;
        if(data == array){
            alert("não há dados para a data informada")
        }
    }
    console.log(data);


    var lastDayDate = data[data.length-1]?.data ? data[data.length - 1]?.data : null;

    const dataPower = [];
    const dataVoltage = [];
    const dataCurrent = [];
    const dataTempB = [];
    const dataTempA = [];

    if (lastDayDate) {

        for(let i = 0; i < data.length; i++) {
            let date = new Date(
                parseInt(data[i]?.ano),
                parseInt(data[i]?.mes)-1,
                parseInt(data[i]?.dia),
                parseInt(data[i]?.hora)-3,
                parseInt(data[i]?.tempo.slice(3,5))).getTime();
            dataPower.push([date, (parseFloat(data[i]?.potencia)/1000)]);
            dataVoltage.push([date, parseFloat(data[i]?.tensao)]);
            dataCurrent.push([date, parseFloat(data[i]?.corrente)]);
            dataTempA.push([date, parseFloat(data[i]?.tempA)]);
            dataTempB.push([date, parseFloat(data[i]?.tempB)]);
        }
    }

    const powerOptions:ApexOptions = {
        chart: {
            id: "basic-bar",
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Horas"
            }
        },
        dataLabels:{
            enabled:false
        },
        noData: {
            text: "Carregando...",
            align: "center",
            verticalAlign: "middle",
        },
        yaxis:{
            title:{
                text:"Potencia"
            }
        }, 
    }

    const tempOptions:ApexOptions = {
        chart: {
            id: "basic-bar"
        },
        xaxis:{
            type: "datetime",
            title:{
                text:"Tempo"
            }
        },
        noData: {
            text: "Carregando...",
            align: "center",
            verticalAlign: "middle",
        },
        dataLabels:{
            enabled:false
        },
        yaxis:{
            title:{
                text:"Temperatura"
            }
        }
    }

    const currentAndVoltageOptions:ApexOptions = {
        chart: {
            id: "basic-bar"
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
            tooltip: {
                shared: false,
                intersect: true,
                x: {
                show: false
                }
            },
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
        colors: ["#FF1654", "#247BA0"]
    }

    const currentAndVoltageSeries:ApexAxisChartSeries = [
        {
            name: 'Volts',
            data: dataVoltage
        }, 
        {
            name: 'Amper',
            data: dataCurrent
        }
    ]

    const powerSeries:ApexAxisChartSeries = [
        {
            name: 'Kwh',
            data: dataPower
        }
    ]

    const tempASeries:ApexAxisChartSeries = [
        {
            name: '°C',
            data: dataTempA
        }
    ]

    const tempBSeries:ApexAxisChartSeries = [
        {
            name: '°C',
            data: dataTempB
        }
    ]

    return (
        <div className='-z-10 bg-white flex-col'>
            <div className='flex'>
                <div className='w-1/2'>
                    <div className="items-center justify-center text-center font-semibold text-lg">Corrente (A) e Tensão (V)</div>
                    <Chart
                        type="area"
                        options={currentAndVoltageOptions}
                        series={currentAndVoltageSeries}
                        width="100%"
                        height="300vh"
                    />
                </div>
                <div className='w-1/2'>
                    <div className="items-center justify-center text-center font-semibold text-lg">Potencia (kW)</div>
                        <Chart
                            type="area"
                            options={powerOptions}
                            series={powerSeries}
                            width="100%"
                            height="300vh"
                        />
                </div>
            </div>
            <div className='flex'>
                <div className='w-1/2'>
                    <div className="items-center justify-center text-center font-semibold text-lg">Temperatura Ambiente (°C)</div>
                    <Chart
                        type="area"
                        options={tempOptions}
                        series={tempASeries}
                        width="100%"
                        height="300vh"
                    />
                </div>
                <div className='w-1/2'>
                    <div className="items-center justify-center text-center font-semibold text-lg">Temperatura Da Placa (°C)</div>
                        <Chart
                            type="area"
                            options={tempOptions}
                            series={tempBSeries }
                            width="100%"
                            height="300vh"
                        />
                </div>
            </div>
        </div>
    );

    
}
