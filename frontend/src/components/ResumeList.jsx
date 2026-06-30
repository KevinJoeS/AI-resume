function ResumeList({ resumes, onDelete, onEdit }) {
  return (
    <div>
      <h2>Saved Resumes</h2>

      {resumes.length === 0 ? (
        <p>No resumes found.</p>
      ) : (
        resumes.map((resume) => (
          <div
            key={resume._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{resume.name}</h3>

            <p>
              <strong>Role:</strong> {resume.role}
            </p>

            <p>
              <strong>Email:</strong> {resume.email}
            </p>

            <button
              onClick={() => onEdit(resume)}
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(resume._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ResumeList;