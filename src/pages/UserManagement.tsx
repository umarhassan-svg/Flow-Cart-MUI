import LayoutMain from "../components/layout/layoutMain";
import UsersTable from "../components/CustomUI/UsersTable/UsersTable";

const UsersManagement = () => {
  return (
    <LayoutMain>
      <UsersTable
        users={users}
        loading={loading}
        total={total}
        page={page}
        rowsPerPage={limit}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setLimit(parseInt(e.target.value, 10));
          setPage(0);
        }}
        onEdit={(u) => openEdit(u)}
        onDelete={(u) => handleDeleteConfirm(u)}
      />
    </LayoutMain>
  );
};

export default UsersManagement;
