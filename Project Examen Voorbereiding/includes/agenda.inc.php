<h1>Agenda</h1>
<table>
	<?php
		require "php/connect.php";
		
		$date = date_create("2013-03-15");
		//$time = ();
		$beginZondag = date_create("2020-04-26");
		//$beginZondag = date("l");
		//echo $beginZondag;

		$test = date_create("2020-04-28 13:00:00");
		//echo date_format($test, "Y-m-d-l");

		$instellingen = array(
			"begintijd"=>8,
			"eindtijd"=>18,
			"startdatum"=>1587852000,
			"einddatum"=>1588456800,
			"delenPerUur"=>2
		);

		$bezetteTijden = array();

		//$sql = "SELECT * FROM werkzaamheden WHERE Datum >= '" . $instellingen['startdatum'] . " 00:00:00' AND Datum <'" . $instellingen['einddatum'] . " 00:00:00'";
		//$sql = "SELECT * FROM werkzaamheden WHERE Datum BETWEEN '" . $instellingen['startdatum'] . " 00:00:00' AND '" . $instellingen['einddatum'] . " 23:59:59'";
		$sql = "SELECT * FROM werkzaamheden";
		//$sql = "SELECT * FROM werkzaamheden ";
		$result = $conn->prepare($sql);
		$result ->execute();

		$werkzaamheden = array(1588404600);
		while($werkzaamheid_par = $result->fetch(PDO::FETCH_ASSOC)) {
			$offset = $werkzaamheid_par["Datum"] % (3600 / $instellingen['delenPerUur']);
			$werkzaamheid_par["celHoogte"] = floor(($werkzaamheid_par["LengteInMin"] * 60 + $offset) / 3600 * $instellingen['delenPerUur']);
			$werkzaamheden[$werkzaamheid_par["Datum"] - $offset] = $werkzaamheid_par;
			if($werkzaamheid_par["celHoogte"] > 1){
				$i = $werkzaamheid_par["celHoogte"] - 1;
				while($i > 0){
					array_push($bezetteTijden, $werkzaamheid_par["Datum"] - $offset + $i * 3600 / $instellingen["delenPerUur"]);
					$i--;
				}
			}
		}
		
	?>

	<table id="agenda">
		<tr>
			<th></th>
			<th>Zondag</th>
			<th>Maandag</th>
			<th>Dinsdag</th>
			<th>Woensdag</th>
			<th>Donderdag</th>
			<th>Vrijdag</th>
			<th>Zaterdag</th>
		</tr>
		<?php
			$i = 0;

			$tijd = date_create();
			$tijd = date_timestamp_set($tijd, $instellingen['startdatum']);

			while($instellingen['begintijd'] * $instellingen['delenPerUur'] + $i < $instellingen['eindtijd'] * $instellingen['delenPerUur']){
				date_timestamp_set($tijd, $instellingen['startdatum'] + ($instellingen['begintijd'] + ($i / $instellingen['delenPerUur'])) * 3600);
				echo "<tr><td>" . date_format($tijd, "H:i") . "</td>";
				$dag = 0;
				
				while($dag < 7){
					if(isset($werkzaamheden[date_timestamp_get($tijd) + $dag * 86400])){
						$werkzaamheid = $werkzaamheden[date_timestamp_get($tijd) + $dag * 86400];
						echo "<td class='agendaItem' rowspan='" . $werkzaamheid['celHoogte'] . "'>";
						echo $werkzaamheid['Type'];
						echo "<div class='agendaItemInfo'>";
						echo "<h1>" . $werkzaamheid['Type'] . "</h1>";
						
						echo date_format(date_timestamp_set(date_create(), $werkzaamheid['Datum']), "H:i") . " t/m " . date_format(date_timestamp_set(date_create(), ($werkzaamheid['Datum']+ $werkzaamheid['LengteInMin'] * 60)), "H:i");
						echo "<br><br><span>" . $werkzaamheid['Toelichting'] . "</span>";
						if(RequestPermission("WerkzaamheidWijzigen", $_SESSION['User']['rol'])){
							echo "<br><br><a href='?page=werkzaamheidWijzigen.inc.php&id=" . $werkzaamheid['Id'] . "'><button>Wijzigen</button></a>";
						}
						echo "</div>";
						echo "</td>";
					}else{
						if(array_search(date_timestamp_get($tijd) + $dag * 86400, $bezetteTijden) OR date_timestamp_get($tijd) + $dag * 86400 == 1588404600){

						}else{
							echo "<td>";
							
							echo "</td>";
						}
					}
					$dag++;
				}
				echo "</tr>";
				$i++;
			}
		?>
	</table>
</table>