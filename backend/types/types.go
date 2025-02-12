package types

type Response struct {
	Data   interface{} `json:"data"`
	Status int8        `json:"status"`
}

type Metadata struct {
	Deleted   bool   `json:"deleted" db:"deleted" ignore:"true"`
	CreatedAt int64  `json:"createdAt" db:"created_at" ignore:"true"`
	UpdatedAt int64  `json:"updatedAt" db:"updated_at" ignore:"true"`
	CreatedBy string `json:"createdBy" db:"created_by" ignore:"true"`
	UpdatedBy string `json:"updtedBy" db:"updted_by" ignore:"true"`
}
