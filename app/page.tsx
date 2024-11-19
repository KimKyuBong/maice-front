import Dashboard from './components/Dashboard';
import { getAllStudents, getStudentResults } from './utils/api';
import type { Student, Grading } from './types/student';

export default async function Home() {
    try {
        const [students] = await Promise.all([
            Promise.race([
                getAllStudents(),
                new Promise<Student[]>((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 10000)
                )
            ])
        ]);
        
        const initialResults = students.length > 0 
            ? await getStudentResults(students[0].id)
            : {};

        return (
            <div className="min-h-screen bg-gray-50">
                <Dashboard 
                    students={students} 
                    initialResults={initialResults}
                    initialStudentId={students.length > 0 ? students[0].id : null}
                />
            </div>
        );
    } catch (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">
                    데이터를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.
                </div>
            </div>
        );
    }
}
