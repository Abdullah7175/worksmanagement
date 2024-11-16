import UserForm from './addVideoForm';
import { UserProvider } from './VideoContext';

const Page = () => {
  return (
    <UserProvider>
      <div className='flex flex-col items-center justify-center mt-20 w-full'>
        <h1 className='text-4xl font-bold text-blue-950 mb-3'>Create a New Video</h1>
        <UserForm />
      </div>
    </UserProvider>
  );
};

export default Page;
