import {RequestForm} from '@/components/RequestForm';

const PublicRequestPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <RequestForm isPublic={true} />
        </div>
    );
};

export default PublicRequestPage;