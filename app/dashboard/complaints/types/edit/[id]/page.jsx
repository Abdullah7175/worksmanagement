import { CopyPlus } from 'lucide-react';
import TypeForm from './updateTypeForm';
import { TypeProvider } from './TypeContext';

const Page = () => {
  return (
    <TypeProvider>
      <div className='bg-slate-50 p-3 h-full'>
        <div className="flex items-center justify-between bg-white mx-auto mt-10 mb-5 shadow-sm border sm:rounded-lg p-6 max-w-7xl ">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Edit Subtype</h1>
            <p className="mt-2 text-gray-600">Change or update details below.</p>
          </div>
          <CopyPlus className="w-8 h-8 text-blue-950" />
        </div>
        <div className='flex flex-col items-center justify-center  w-full'>
          <TypeForm />
        </div>
      </div>
    </TypeProvider>
  );
};

export default Page;
