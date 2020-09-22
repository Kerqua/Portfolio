<table id="tableGebruikers">
	<tr>
		<th style="width:25%;">Id</th>
		<th style="width:30%;">Naam</th>
		<th style="width:30%;">Email</th>
		<th style="width:8%;">Rol</th>
		<th style="width:8%;">Functies</th>
	</tr>
	<?php
		require "php/connect.php";
		
		$sql_user = "SELECT * FROM gebruikers";
		$result = $conn->prepare($sql_user);
		$result ->execute();
		
		while($user_par = $result->fetch(PDO::FETCH_ASSOC)) {
			echo "	<tr>
				<td>" . $user_par['Id'] . "</td>
				<td>" . $user_par['Naam'] . "</td>
				<td>" . $user_par['Email'] . "</td>
				<td>" . $user_par['Rol'] . "</td>
				<td>";
			if(RequestPermission("GebruikerWijzigen", $_SESSION['User']['rol'])){
				echo "<a href='?page=gebruikerWijzigen.inc.php&id=" . $user_par['Id'] . "'><button class='tableFunctie'>Aanpassen</button></a>";
			}
			if(RequestPermission("GebruikerVerwijderen", $_SESSION['User']['rol'])){
				echo "<a href='php/gebruikerVerwijderen.php?id=" . $user_par['Id'] . "' onclick='return confirm(\"Gebruiker verwijderen?\")'><button class='tableFunctie'>Verwijderen</button></a>";//
			}
		}
	?>
</table>
<br>
<?php
	if(RequestPermission("GebruikerRegistreren", $_SESSION['User']['rol'])){
		echo "<a href='?page=gebruikerRegistreer.inc.php'><button>Gebruiker toevoegen</button></a>";
	}
?>