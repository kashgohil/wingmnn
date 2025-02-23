package user

type User struct {
	ID             string `json:"id" db:"id"`
	Name           string `json:"name" db:"name"`
	Email          string `json:"email" db:"email"`
	Bio            string `json:"bio" db:"bio"`
	ProfilePicture string `json:"profilePicture" db:"profile_picture"`
	VerifiedEmail  bool   `json:"verifiedEmail" db:"verified_email"`
	Username       string `json:"username" db:"username"`
	HashedPassword string `json:"-" db:"hashed_password"`
	CurrentTheme   string `json:"currentTheme" db:"current_theme"`
	Deleted        bool   `json:"deleted" db:"deleted" ignore:"true"`
	UpdatedBy      string `json:"updatedBy" db:"updated_by" ignore:"true"`
	CreatedBy      string `json:"createdBy" db:"created_by" ignore:"true"`
	UpdatedAt      int64  `json:"updatedAt" db:"updated_at" ignore:"true"`
	CreatedAt      int64  `json:"createdAt" db:"created_at" ignore:"true"`
}
