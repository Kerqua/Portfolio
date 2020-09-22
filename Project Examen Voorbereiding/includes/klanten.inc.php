<table id="tableKlanten">
	<tr>
		<th style="width:20%;">Id</th>
		<th style="width:10%;">Voornaam</th>
		<th style="width:10%;">Achternaam</th>
		<th style="width:5%;">Tussenvoegsel</th>
		<th style="width:10%;">Email</th>
		<th style="width:10%;">Woonplaats</th>
		<th style="width:10%;">Straat</th>
		<th style="width:5%;">Huisnummer</th>
		<th style="width:5%;">Postcode</th>
		<th style="width:5%;">Telefoonnummer</th>
		<th style="width:15%;">Functies</th>
	</tr>

	<?php
		require "php/connect.php";
				
		$sql = "SELECT * FROM klanten";
		$result = $conn->prepare($sql);
		$result ->execute();
					
		while($klant_par = $result->fetch(PDO::FETCH_ASSOC)) {
			echo "	<tr>
				<td>" . $klant_par['Id'] . "</td>
				<td>" . $klant_par['Voornaam'] . "</td>
				<td>" . $klant_par['Achternaam'] . "</td>
				<td>" . $klant_par['Tussenvoegsel'] . "</td>
				<td>" . $klant_par['Email'] . "</td>
				<td>" . $klant_par['Woonplaats'] . "</td>
				<td>" . $klant_par['Straat'] . "</td>
				<td>" . $klant_par['Huisnummer'] . "</td>
				<td>" . $klant_par['Postcode'] . "</td>
				<td>" . $klant_par['Telefoonnummer'] . "</td>
				<td>";
			if(RequestPermission("KlantWijzigen", $_SESSION['User']['rol'])){
				echo "<a href='?page=klantWijzigen.inc.php&id=" . $klant_par['Id'] . "'><button class='tableFunctie'>Aanpassen</button></a>";
			}
			if(RequestPermission("KlantVerwijderen", $_SESSION['User']['rol'])){
				echo "<a href='php/klantVerwijderen.php?id=" . $klant_par['Id'] . "' onclick='return confirm(\"Klant verwijderen?\")'><button class='tableFunctie'>Verwijderen</button></a>";//
			}
			if(RequestPermission("WerkzaamheidRegistreren", $_SESSION['User']['rol'])){
				echo "<a href='?page=werkzaamheidRegistreer.inc.php&klantId=" . $klant_par['Id'] . "'><button class='tableFunctie'>Werkzaam registreren</button></a>";
			}
			echo "</td></tr>";
		}
	?>
</table>
<br>
<?php
	if(RequestPermission("KlantRegistreren", $_SESSION['User']['rol'])){
		echo "<a href='?page=klantRegistreer.inc.php'><button>Klant toevoegen</button></a>";
	}
?>