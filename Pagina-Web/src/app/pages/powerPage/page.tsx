"use client"
import { Suspense} from "react";
import {PowerChart} from "../../components/charts/realTimeChats";
import {LastDateInApi} from "../../components/util/tabBar";

export default function Home() {
    //pagina referente ao grafico de Potencia
    return (
        <main className="flex-col min-h-screen pl-12 pr-12">
            <div className=" flex-col justify-center items-center">
                <LastDateInApi/>
                <PowerChart/>

            </div>
        
        
        </main>
    );
}