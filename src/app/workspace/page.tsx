import { SlideWorkspace } from "@/components/workspace";

export default function WorkspacePage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <div className="max-w-[1600px] mx-auto space-y-4">
                <header className="flex items-center justify-between pb-4 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">SlideArchitect Workspace</h1>
                        <p className="text-slate-500">Mode création & révision</p>
                    </div>
                </header>

                <SlideWorkspace />
            </div>
        </div>
    );
}
