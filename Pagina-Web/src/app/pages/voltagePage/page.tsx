"use client"
import {CurrentxVoltageChart} from "../../components/charts/realTimeChats";
import {LastDateInApi} from "../../components/util/tabBar";

export default function Home() {
    //pagina referente Ao grafico de tensão e corrente
    return (
        <main className="flex-col min-h-screen pl-12 pr-12">
            <div className=" flex-col justify-center items-center">
                <LastDateInApi/>
                <CurrentxVoltageChart/>
            </div>
        </main>
    );
}