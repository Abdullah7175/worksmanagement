import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MessageCircleWarning, Activity, CheckCheck } from "lucide-react"
import { LineChartWithValues } from "@/components/lineChart"
import { PieChartWithValues } from "@/components/pieChart"
const page = () => {
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row w-full gap-5">
                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <MessageCircleWarning className="text-yellow-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Total Compalints
                            </p>
                            <p className="text-sm text-muted-foreground">
                                14000
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <Activity className="text-red-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Active Compalints
                            </p>
                            <p className="text-sm text-muted-foreground">
                                7000
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="w-full lg:w-1/3 bg-slate-50 border-2 shadow-md">
                    <div className="flex items-center space-x-4 rounded-md p-6">
                        <CheckCheck className="text-green-700" />
                        <div className="flex-1 space-y-1">
                            <p className="text-md font-medium leading-none">
                                Resolved Compalints
                            </p>
                            <p className="text-sm text-muted-foreground">
                                7000
                            </p>
                        </div>
                    </div>
                </Card>

            </div>

            <div className="flex flex-col lg:flex-row w-full gap-8 mt-10">
                <div className="w-full xl:w-2/3">
                    <LineChartWithValues />
                </div>
                <div className="w-full xl:w-1/3">
                    <PieChartWithValues />
                </div>
            </div>

            <div className="flex flex-col bg-slate-100 lg:flex-row w-full gap-8 mt-10 h-60">
        
            </div>
        </div>

    )
}

export default page