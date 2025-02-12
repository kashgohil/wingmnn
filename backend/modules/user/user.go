package user

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/kashgohil/wingmnn/backend/server"
	"github.com/kashgohil/wingmnn/backend/types"
	"github.com/kashgohil/wingmnn/backend/utility"
)

type User struct {
	ID             string `json:"id" db:"id"`
	Name           string `json:"name" db:"name"`
	Email          string `json:"email" db:"email"`
	Bio            string `json:"bio" db:"bio"`
	VerifiedEmail  bool   `json:"verifiedEmail" db:"verified_email"`
	Username       string `json:"username" db:"username"`
	HashedPassword string `json:"hashedPassword" db:"-"`
	types.Metadata
}

func Get(UserID string) (*User, error) {
	query, args := utility.BuildGetQuery("users", UserID)

	rows, err := server.DBPool.Query(context.Background(), query, args...)

	if err != nil && err == pgx.ErrNoRows {
		log.Printf("[USER][GET] no user found for id = %v \n", UserID)
		return nil, err
	} else if err != nil {
		log.Println("[USER][GET] something went wrong: ", err)
		return nil, err
	}

	user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])

	return &user, err
}

func Create(user User) (*User, error) {
	query, args := utility.BuildCreateQuery("users", "SYSTEM", user)
	rows, err := server.DBPool.Query(context.Background(), query, args...)

	if err != nil {
		log.Println("[USER][CREATE] something went wrong: ", err)
		return nil, err
	}

	createdUser, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])

	return &createdUser, err
}

func Update(user User) (*User, error) {
	if user.ID == "" {
		log.Println("[USER][UPDATE] id is required while updating")
	}
	query, args := utility.BuildUpdateQuery("users", user.ID, user)
	rows, err := server.DBPool.Query(context.Background(), query, args...)

	if err != nil {
		log.Println("[USER][CREATE] something went wrong: ", err)
		return nil, err
	}

	createdUser, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])

	return &createdUser, err
}
