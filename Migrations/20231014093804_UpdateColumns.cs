using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SSO.Migrations
{
    /// <inheritdoc />
    public partial class UpdateColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Users",
                newName: "Login");

            migrationBuilder.RenameColumn(
                name: "TokenHash",
                table: "Tokens",
                newName: "Token");

            migrationBuilder.RenameColumn(
                name: "ExpiredDateTime",
                table: "Tokens",
                newName: "ExpirationDateTime");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Login",
                table: "Users",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "Token",
                table: "Tokens",
                newName: "TokenHash");

            migrationBuilder.RenameColumn(
                name: "ExpirationDateTime",
                table: "Tokens",
                newName: "ExpiredDateTime");
        }
    }
}
