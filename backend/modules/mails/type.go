package mails

type Mail struct {
	ID           string
	Subject      string
	Body         string
	SenderID     string
	RecipientIDs []string
	CcIDs        []string
	BccIDs       []string
	Attachments  []string
	Deleted      bool   `json:"deleted" db:"deleted" ignore:"true"`
	UpdatedBy    string `json:"updatedBy" db:"updated_by" ignore:"true"`
	CreatedBy    string `json:"createdBy" db:"created_by" ignore:"true"`
	UpdatedAt    int64  `json:"updatedAt" db:"updated_at" ignore:"true"`
	CreatedAt    int64  `json:"createdAt" db:"created_at" ignore:"true"`
}
