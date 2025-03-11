package projects

type Project struct {
	ID          string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Deleted     bool   `json:"deleted" db:"deleted" ignore:"true"`
	UpdatedBy   string `json:"updatedBy" db:"updated_by" ignore:"true"`
	CreatedBy   string `json:"createdBy" db:"created_by" ignore:"true"`
	UpdatedAt   int64  `json:"updatedAt" db:"updated_at" ignore:"true"`
	CreatedAt   int64  `json:"createdAt" db:"created_at" ignore:"true"`
}
