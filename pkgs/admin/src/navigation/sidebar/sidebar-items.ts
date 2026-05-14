import {
    Banknote,
    Bot,
    Building2,
    Calendar,
    ChartBar,
    Fingerprint,
    Gauge,
    GraduationCap,
    Kanban,
    LayoutDashboard,
    ListTodo,
    type LucideIcon,
    Mail,
    MessageSquare,
    ReceiptText,
    ShoppingBag,
    Users,
} from "lucide-react";

export interface NavSubItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    comingSoon?: boolean;
    newTab?: boolean;
    isNew?: boolean;
}

export interface NavMainItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    subItems?: NavSubItem[];
    comingSoon?: boolean;
    newTab?: boolean;
    isNew?: boolean;
}

export interface NavGroup {
    id: number;
    label?: string;
    items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
    {
        id: 1,
        label: "Dashboards",
        items: [
            {
                title: "Overview",
                url: "/dashboard/default",
                icon: LayoutDashboard,
            },
            {
                title: "Exhibitions",
                url: "/dashboard/exhibitions",
                icon: Building2,
            },
            {
                title: "Agents",
                url: "/dashboard/agents",
                icon: Bot,
            },
            {
                title: "Conversations",
                url: "/dashboard/conversations",
                icon: MessageSquare,
            },
            {
                title: "Users",
                url: "/dashboard/users",
                icon: Users,
            },
        ],
    },
    {
        id: 2,
        label: "Legacy Dashboards",
        items: [
            {
                title: "CRM",
                url: "/dashboard/crm",
                icon: ChartBar,
            },
            {
                title: "Finance",
                url: "/dashboard/finance",
                icon: Banknote,
            },
            {
                title: "Analytics",
                url: "/dashboard/analytics",
                icon: Gauge,
            },
            {
                title: "Productivity",
                url: "/dashboard/productivity",
                icon: ListTodo,
            },
            {
                title: "E-commerce",
                url: "/dashboard/ecommerce",
                icon: ShoppingBag,
            },
            {
                title: "Academy",
                url: "/dashboard/academy",
                icon: GraduationCap,
            },
        ],
    },
    {
        id: 3,
        label: "Legacy Pages",
        items: [
            {
                title: "Email",
                url: "/dashboard/coming-soon",
                icon: Mail,
                comingSoon: true,
            },
            {
                title: "Chat",
                url: "/dashboard/coming-soon",
                icon: MessageSquare,
                comingSoon: true,
            },
            {
                title: "Calendar",
                url: "/dashboard/coming-soon",
                icon: Calendar,
                comingSoon: true,
            },
            {
                title: "Kanban",
                url: "/dashboard/coming-soon",
                icon: Kanban,
                comingSoon: true,
            },
            {
                title: "Invoice",
                url: "/dashboard/coming-soon",
                icon: ReceiptText,
                comingSoon: true,
            },
            {
                title: "Authentication",
                url: "/auth",
                icon: Fingerprint,
                subItems: [
                    { title: "Login v1", url: "/auth/v1/login", newTab: true },
                    { title: "Login v2", url: "/auth/v2/login", newTab: true },
                    { title: "Register v1", url: "/auth/v1/register", newTab: true },
                    { title: "Register v2", url: "/auth/v2/register", newTab: true },
                ],
            },
        ],
    },
];
