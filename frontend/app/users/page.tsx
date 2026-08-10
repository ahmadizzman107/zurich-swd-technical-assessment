import Footer from '../components/Footer';
import Header from '../components/Header';
import UserList from '../components/UserList';

function UsersPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header title='Users' />
      <main className='flex-1 p-6'>
        <UserList />
      </main>
      <Footer />
    </div>
  );
}

export default UsersPage;
