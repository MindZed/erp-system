// mindzed/erp-system/erp-system-02abb7b4465004ac728e062c9a31c5e4ef5ac40a/src/app/dashboard/page.tsx

import { auth } from "@/auth"; 
import { redirect } from "next/navigation";
import { fetchDashboardData } from "@/actions/dashboard.actions";
import { UserRole } from "@prisma/client";
import { BasilAdd } from "../components/Svgs/svgs"; 

// --- Helper Components for Dashboard Layout ---

interface KPICardProps {
    title: string;
    value: number;
    subtext?: string;
    subvalue?: number;
    total?: number;
    color?: string; // Tailwind color class for value
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtext, subvalue, total, color = 'text-primaryRed' }) => (
    <div className="bg-zGrey-1 p-5 rounded-xl shadow-lg flex flex-col space-y-2">
        <h3 className="text-zGrey-3 text-sm font-semibold">{title}</h3>
        {/* Pad start with '0' for visual effect, matching the image */}
        <p className={`text-5xl font-extrabold ${color}`}>{value.toString().padStart(2, '0')}</p> 
        {(subtext && subvalue !== undefined) && (
            <p className="text-xs text-zGrey-3">
                {subtext}: <span className="text-white">{subvalue}</span>
            </p>
        )}
        {/* Only show Total if needed, based on the image pattern */}
        {title === "Client" || title === "Project" ? (
             <p className="text-xs text-zGrey-3">Total {title}s: <span className="text-white">{total}</span></p>
        ) : (
            subtext === "Currently Working" && <p className="text-xs text-zGrey-3">Total Members: <span className="text-white">{total}</span></p>
        )}
    </div>
);

// Helper for data display as seen in the image
const MockCircularChart = ({ title, percent }: { title: string, percent: number }) => (
    <div className="flex flex-col items-center space-y-2 w-1/2">
        <div className="relative h-20 w-20">
            {/* Simple Tailwind mock for the circular progress bar */}
            <div className="h-full w-full rounded-full border-4 border-gray-600 absolute"></div>
            <div 
                className="h-full w-full rounded-full border-4 border-primaryRed absolute transform rotate-180" 
                style={{ clipPath: `polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)` }} 
            ></div>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">
                {percent}%
            </span>
        </div>
        <p className="text-xs text-zGrey-3">{title}</p>
    </div>
);

const ProjectOverviewSection = ({ techLead }: any) => {
    
    // Mock the Project Timeline (Gantt-like chart data based on the image)
    const timelineData = [
        { name: 'Deployment', progress: 100, color: 'bg-red-500' },
        { name: 'Testing & QA', progress: 75, color: 'bg-pink-500' },
        { name: 'Backend', progress: 50, color: 'bg-green-500' },
        { name: 'Frontend', progress: 25, color: 'bg-yellow-500' },
        { name: 'UX/UI', progress: 10, color: 'bg-purple-500' },
        { name: 'Planning', progress: 0, color: 'bg-indigo-500' },
        { name: 'SEO', progress: 0, color: 'bg-blue-500' },
        { name: 'Content', progress: 0, color: 'bg-teal-500' },
    ];
    
    // Mock the X-axis dates from the image
    const xAxisDates = ['22 Oct', '29 Oct', '8 Nov', '15 Nov', '22 Nov', '29 Nov', '8 Dec', '15 Dec'];

    const ProgressRow = ({ name, progress, color }: any) => {
        // Mocked layout approximation
        const mockWidth = `60%`; 
        const progressWidth = `${progress}%`;
        const mockLeft = `${Math.random() * 30}%`;

        return (
            <div className="flex items-center text-xs text-zGrey-3 h-6">
                <span className="w-20 text-right pr-2">{name}</span>
                <div className="flex-1 h-3 bg-gray-800 relative rounded-sm">
                    <div 
                        className={`absolute h-full rounded-sm ${color}`} 
                        style={{ width: mockWidth, left: mockLeft }}
                    >
                        <div 
                            className={`h-full ${progress === 100 ? 'bg-active' : 'bg-white/50'} rounded-sm`} 
                            style={{ width: progressWidth }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-zGrey-1 p-5 rounded-xl shadow-lg row-span-2 flex flex-col h-full">
            <h3 className="text-white text-lg font-bold mb-4">Project Overview</h3>
            
            {/* Top Bar KPI (Mocked, similar to image) */}
            <div className="border-b border-zGrey-2 pb-4 mb-4">
                <h4 className="text-white text-xl font-semibold">MINDZED ERP</h4>
                <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-active h-2.5 rounded-full" style={{ width: `75%` }}></div>
                    </div>
                    <span className="text-xs text-zGrey-3 ml-2">75%</span>
                </div>
                <div className="flex justify-between text-xs text-zGrey-3 mt-2">
                    <p>Tech Lead: {techLead}</p>
                    <p>Deadline: 31 Dec 25</p>
                </div>
            </div>

            {/* Project Timeline (Mock Gantt Chart) */}
            <h4 className="text-zGrey-3 text-sm font-semibold mb-2">Project Timeline</h4>
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="min-w-[600px] pb-2">
                    {timelineData.map(item => (
                        <ProgressRow key={item.name} {...item} />
                    ))}
                    
                    {/* X-Axis */}
                    <div className="flex text-zGrey-3 text-xs mt-1 h-6">
                        <span className="w-20 pr-2"></span>
                        <div className="flex-1 flex justify-around px-2">
                            {xAxisDates.map(date => (
                                <span key={date} className="w-1/8 text-center">{date}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectsListSection = ({ projectOverviewList }: any) => (
    <div className="bg-zGrey-1 p-5 rounded-xl shadow-lg">
        <h3 className="text-white text-lg font-bold mb-4">Projects List</h3>
        <div className="space-y-3">
            {/* Dynamically rendered list from DB */}
            {projectOverviewList.map((project: any) => (
                <div key={project.name} className="flex justify-between items-center text-sm">
                    <span className="text-white truncate max-w-[60%]">{project.name}</span>
                    <div className="flex items-center text-xs">
                        <span className="text-zGrey-3 mr-2">{project.progress}%</span>
                        {/* Status coloring based on 'over' presence in timeStatus */}
                        <span className={`font-semibold ${project.timeStatus.includes('over') ? 'text-primaryRed' : 'text-active'}`}>
                            {project.timeStatus}
                        </span>
                    </div>
                </div>
            ))}
            {/* Mock Projects for visual completeness, matching the image */}
            <div className="flex justify-between items-center text-sm">
                <span className="text-white truncate max-w-[60%]">MINDZED WEBSITE</span>
                <div className="flex items-center text-xs">
                    <span className="text-zGrey-3 mr-2">22%</span>
                    <span className="font-semibold text-active">2d remaining</span>
                </div>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-white truncate max-w-[60%]">ELECTRIC BILLING SOFTWARE</span>
                <div className="flex items-center text-xs">
                    <span className="text-zGrey-3 mr-2">95%</span>
                    <span className="font-semibold text-primaryRed">4d over</span>
                </div>
            </div>
        </div>
    </div>
);


// --- MAIN PAGE COMPONENT ---
export default async function DashboardPage() {
    
    const session = await auth();
    if (!session || !session.user) {
        redirect('/login'); 
    }
    
    // 2. Fetch all dashboard data
    const data = await fetchDashboardData();

    const { client, project, talent, projectOverviewList, mockedData } = data;

    const isManagerOrAdmin = (session.user as any)?.role === UserRole.ADMIN || (session.user as any)?.role === UserRole.MANAGER;

    return (
        <div className="p-6 bg-zBlack min-h-screen text-white">
            
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* 1. KPI Cards (Client, Project, Talent, Work Hour) */}
                <div className="lg:col-span-1 xl:col-span-2 grid grid-cols-2 gap-6 auto-rows-min">
                    <KPICard 
                        title="Client" 
                        value={client.active} 
                        subtext="On Hold" 
                        subvalue={client.onHold} 
                        total={client.total} 
                    />
                    <KPICard 
                        title="Project" 
                        value={project.active} 
                        subtext="On Hold" 
                        subvalue={project.onHold} 
                        total={project.total} 
                    />
                    <KPICard 
                        title="Talent" 
                        value={talent.currentlyWorking} 
                        subtext="Currently Working" 
                        subvalue={talent.totalMembers} 
                        total={talent.totalMembers} 
                        color="text-active"
                    />
                    <KPICard 
                        title="Work Hour" 
                        value={mockedData.workHoursTotal} 
                        subtext="Hours This Year" 
                        subvalue={mockedData.workHoursThisYear} 
                        total={mockedData.workHoursTotal} 
                        color="text-yellow-500"
                    />
                </div>
                
                {/* 2. Project Overview (Timeline/Gantt Chart Mock) */}
                <div className="lg:col-span-2 xl:col-span-2">
                    <ProjectOverviewSection techLead={data.talent.techLead} />
                </div>
                
                {/* 3. Weekly Hours Chart (Mocked) */}
                <div className="bg-zGrey-1 p-5 rounded-xl shadow-lg col-span-full lg:col-span-2 xl:col-span-2">
                    <h3 className="text-white text-lg font-bold mb-4">Weekly Hours</h3>
                    <div className="h-40 flex items-end justify-around px-2">
                        {mockedData.weeklyHours.map(data => (
                            <div key={data.day} className="flex flex-col items-center h-full justify-end">
                                <div className="text-xs text-zGrey-3 mb-1">{data.hours}h</div>
                                <div 
                                    className="w-8 bg-primaryRed rounded-t-lg transition-all duration-300"
                                    // Scale the height relative to a max of 10
                                    style={{ height: `${(data.hours / 10) * 100}%` }}
                                ></div>
                                <span className="text-xs text-zGrey-3 mt-1">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Actions Required (Mocked) */}
                <div className="bg-zGrey-1 p-5 rounded-xl shadow-lg col-span-1">
                    <h3 className="text-white text-lg font-bold mb-4 flex justify-between items-center">
                        Actions Required <BasilAdd className="h-5 text-primaryRed" />
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="text-white">Meeting with link academy <span className="text-xs text-primaryRed block">FROM YOU, ADMIN</span></li>
                        <li className="text-white">Go through new website designs <span className="text-xs text-active block">FROM JUNAID, EMPLOYEE</span></li>
                        <li className="text-white">Domain purchase for Client <span className="text-xs text-yellow-500 block">FROM ARKA, MANAGER</span></li>
                    </ul>
                </div>
                
                {/* 5. Projects List & Circular Charts */}
                <div className="col-span-full lg:col-span-1 xl:col-span-1 flex flex-col space-y-6">
                    <ProjectsListSection projectOverviewList={projectOverviewList} />
                    
                    <div className="bg-zGrey-1 p-5 rounded-xl shadow-lg flex justify-around">
                        <MockCircularChart title="Contribution" percent={mockedData.contributionPercentage} />
                        <MockCircularChart title="Sales" percent={mockedData.salesPercentage} />
                    </div>
                </div>
            </div>

            {/* Optional: Show Session Data for Debug */}
             {isManagerOrAdmin && (
                <div className="mt-8 text-sm text-zGrey-3">
                    <h2 className="text-xl font-bold mb-2 text-white">Debug/Session Data</h2>
                    <pre className="p-4 bg-gray-800 rounded-md">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>
             )}
        </div>
    );
}